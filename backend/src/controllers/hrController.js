const supabase = require('../config/supabase');

const getCandidates = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('submissions')
            .select(`
                *,
                users(email, resume_url),
                assessments(job_id, jobs(title))
            `)
            .order('completed_at', { ascending: false });

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

        // 1. Try to fetch from results
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

        if (result) {
            return res.json(result);
        }

        // 2. Fallback: If no result record, fetch submission directly
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

        // Construct a "pending" result object for the frontend
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

const getHRStats = async (req, res) => {
    try {
        const { data: submissions, error } = await supabase
            .from('submissions')
            .select('score, status, completed_at');

        if (error) throw error;

        // Simple aggregation for stats
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
        console.error('Error fetching HR stats:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
};

const logProctoringViolation = async (req, res) => {
    try {
        const { submissionId, violation } = req.body;
        // Fetch current violations
        const { data: sub, error: fetchErr } = await supabase
            .from('submissions')
            .select('proctoring_violations')
            .eq('id', submissionId)
            .single();

        if (fetchErr) throw fetchErr;

        const updatedViolations = [...(sub.proctoring_violations || []), { ...violation, timestamp: new Date() }];

        const { error: updateErr } = await supabase
            .from('submissions')
            .update({ proctoring_violations: updatedViolations })
            .eq('id', submissionId);

        if (updateErr) throw updateErr;
        res.json({ message: 'Violation logged' });
    } catch (error) {
        console.error('Error logging violation:', error);
        res.status(500).json({ error: 'Failed to log violation' });
    }
};

module.exports = {
    getCandidates,
    getCandidateDetail,
    resetAttempt,
    getHRStats,
    logProctoringViolation
};
