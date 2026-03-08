const supabase = require('../config/supabase');
const { internalGenerateAssessment } = require('./assessmentController');
const { evaluateSubmission } = require('./submissionController');

/**
 * RECRUITER (Consolidated) Controller
 * Handles Job Provisioning, Candidate Management, and Result Auditing
 */

// --- Job Management ---

const triggerAssessmentGeneration = async (req, res) => {
    try {
        const { jobId } = req.body;
        const count = await internalGenerateAssessment(jobId);
        res.json({ message: 'Assessment generated', count });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const addManualCodingQuestion = async (req, res) => {
    try {
        const { assessmentId, questionData } = req.body;
        const normalizedContent = {
            ...questionData,
            starter_code: typeof questionData.starter_code === 'string' ? {
                python: questionData.starter_code,
                javascript: questionData.starter_code,
                java: questionData.starter_code
            } : questionData.starter_code
        };

        const { data, error } = await supabase
            .from('questions')
            .insert([{
                assessment_id: assessmentId,
                type: 'CODING',
                content: normalizedContent,
                marks: questionData.marks || 10,
                topic: questionData.topic || 'DSA'
            }])
            .select()
            .single();

        if (error) throw error;
        res.json({ message: 'Manual coding question added', question: data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// --- Candidate & Result Management (Merged from HR) ---

const getCandidates = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('submissions')
            .select(`
                *,
                users(email, resume_url),
                assessments(id, job_id, jobs(title))
            `)
            .order('started_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Error fetching candidates:', error);
        res.status(500).json({ error: 'Failed to fetch candidates' });
    }
};

const getCandidateDetail = async (req, res) => {
    try {
        const { submissionId } = req.params;

        // First try to find a fully evaluated result
        const { data: result, error: resError } = await supabase
            .from('results')
            .select(`
                *,
                submissions(
                    *,
                    users(email, resume_url),
                    assessments(
                        *,
                        jobs(title),
                        questions(*)
                    )
                )
            `)
            .eq('submission_id', submissionId)
            .maybeSingle();

        if (resError) throw resError;

        // If a result exists, normalize it to always return { submissions, details }
        if (result && result.submissions) {
            return res.json({
                submissions: result.submissions,
                details: result.details || {
                    evaluationDetails: [],
                    sectionScores: { mcq: 0, subjective: 0, coding: 0 },
                    sectionMaxScores: { mcq: 0, subjective: 0, coding: 0 },
                    rawAnswers: {}
                }
            });
        }

        const { data: submission, error: subError } = await supabase
            .from('submissions')
            .select(`
                *,
                users(email, resume_url),
                assessments(
                    *,
                    jobs(title),
                    questions(*)
                )
            `)
            .eq('id', submissionId)
            .maybeSingle();

        if (subError) throw subError;
        if (!submission) return res.status(404).json({ error: 'Candidate submission not found' });

        res.json({
            submissions: submission,
            details: {
                evaluationDetails: [],
                sectionScores: { mcq: 0, subjective: 0, coding: 0 },
                sectionMaxScores: { mcq: 0, subjective: 0, coding: 0 },
                rawAnswers: submission.details?.rawAnswers || {}
            }
        });
    } catch (error) {
        console.error('Error fetching candidate detail:', error);
        res.status(500).json({ error: 'Failed to fetch candidate details' });
    }
};

const triggerResultGeneration = async (req, res) => {
    try {
        const { assessmentId } = req.body;
        const { data: submissions, error } = await supabase
            .from('submissions')
            .select('id')
            .eq('assessment_id', assessmentId);

        if (error) throw error;

        const results = [];
        for (const sub of submissions) {
            const resVal = await evaluateSubmission(sub.id);
            results.push({ submissionId: sub.id, ...resVal });
        }

        res.json({ message: 'Results generated for assessment', processedCount: submissions.length, results });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const resetAttempt = async (req, res) => {
    try {
        const { submissionId } = req.body;
        const { error } = await supabase
            .from('submissions')
            .update({
                attempts_left: 1,
                status: 'IN_PROGRESS',
                completed_at: null,
                score: null
            })
            .eq('id', submissionId);

        if (error) throw error;
        res.json({ message: 'Attempt reset successfully' });
    } catch (error) {
        console.error('Error resetting attempt:', error);
        res.status(500).json({ error: 'Failed to reset attempt' });
    }
};

const getRecruiterStats = async (req, res) => {
    try {
        const { data: submissions, error } = await supabase
            .from('submissions')
            .select('score, status, completed_at');

        if (error) throw error;

        const stats = {
            total: submissions.length,
            completed: submissions.filter(s => s.status === 'COMPLETED').length,
            averageScore: submissions.reduce((acc, curr) => acc + (parseFloat(curr.score) || 0), 0) / (submissions.length || 1),
            scoreDistribution: [
                { range: '0-20', count: submissions.filter(s => s.score < 20).length },
                { range: '20-40', count: submissions.filter(s => s.score >= 20 && s.score < 40).length },
                { range: '40-60', count: submissions.filter(s => s.score >= 40 && s.score < 60).length },
                { range: '60-80', count: submissions.filter(s => s.score >= 60 && s.score < 80).length },
                { range: '80-100', count: submissions.filter(s => s.score >= 80).length },
            ]
        };

        res.json(stats);
    } catch (error) {
        console.error('Error fetching recruiter stats:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
};

module.exports = {
    triggerAssessmentGeneration,
    triggerResultGeneration,
    addManualCodingQuestion,
    getCandidates,
    getCandidateDetail,
    resetAttempt,
    getRecruiterStats
};
