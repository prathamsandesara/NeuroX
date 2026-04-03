const db = require('../config/db');
const { internalGenerateAssessment } = require('./assessmentController');
const { evaluateSubmission } = require('./submissionController');

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

        const { rows } = await db.query(
            'INSERT INTO questions (assessment_id, type, content, marks, topic) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [assessmentId, 'CODING', JSON.stringify(normalizedContent), questionData.marks || 10, questionData.topic || 'DSA']
        );

        res.json({ message: 'Manual coding question added', question: rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getCandidates = async (req, res) => {
    try {
        const query = `
            SELECT 
                s.*,
                json_build_object('email', u.email, 'resume_url', u.resume_url) AS users,
                json_build_object(
                    'id', a.id,
                    'job_id', a.job_id,
                    'jobs', json_build_object('title', j.title)
                ) AS assessments
            FROM submissions s
            JOIN users u ON s.user_id = u.id
            JOIN assessments a ON s.assessment_id = a.id
            JOIN jobs j ON a.job_id = j.id
            ORDER BY s.started_at DESC NULLS LAST
        `;
        const { rows } = await db.query(query);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching candidates:', error);
        res.status(500).json({ error: 'Failed to fetch candidates' });
    }
};

const getCandidateDetail = async (req, res) => {
    try {
        const { submissionId } = req.params;

        const resultQuery = `
            SELECT r.*,
                   json_build_object(
                       'id', s.id,
                       'score', s.score,
                       'status', s.status,
                       'started_at', s.started_at,
                       'completed_at', s.completed_at,
                       'proctoring_violations', s.proctoring_violations,
                       'users', json_build_object('email', u.email, 'resume_url', u.resume_url),
                       'assessments', json_build_object(
                           'id', a.id,
                           'job_id', a.job_id,
                           'jobs', json_build_object('title', j.title),
                           'questions', (
                               SELECT COALESCE(json_agg(q.*), '[]'::json)
                               FROM questions q
                               WHERE q.assessment_id = a.id
                           )
                       )
                   ) AS submissions
            FROM results r
            JOIN submissions s ON r.submission_id = s.id
            JOIN users u ON s.user_id = u.id
            JOIN assessments a ON s.assessment_id = a.id
            JOIN jobs j ON a.job_id = j.id
            WHERE r.submission_id = $1
        `;

        const { rows: resultRows } = await db.query(resultQuery, [submissionId]);

        if (resultRows.length > 0) {
            const result = resultRows[0];
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

        const subQuery = `
            SELECT s.*,
                   json_build_object('email', u.email, 'resume_url', u.resume_url) AS users,
                   json_build_object(
                       'id', a.id,
                       'job_id', a.job_id,
                       'jobs', json_build_object('title', j.title),
                       'questions', (
                           SELECT COALESCE(json_agg(q.*), '[]'::json)
                           FROM questions q
                           WHERE q.assessment_id = a.id
                       )
                   ) AS assessments
            FROM submissions s
            JOIN users u ON s.user_id = u.id
            JOIN assessments a ON s.assessment_id = a.id
            JOIN jobs j ON a.job_id = j.id
            WHERE s.id = $1
        `;

        const { rows: subRows } = await db.query(subQuery, [submissionId]);
        const submission = subRows[0];

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
        const { rows: submissions } = await db.query('SELECT id FROM submissions WHERE assessment_id = $1', [assessmentId]);

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
        await db.query(
            'UPDATE submissions SET attempts_left = 1, status = $1, completed_at = NULL, score = NULL WHERE id = $2',
            ['IN_PROGRESS', submissionId]
        );
        res.json({ message: 'Attempt reset successfully' });
    } catch (error) {
        console.error('Error resetting attempt:', error);
        res.status(500).json({ error: 'Failed to reset attempt' });
    }
};

const getRecruiterStats = async (req, res) => {
    try {
        const { rows: submissions } = await db.query('SELECT score, status, completed_at FROM submissions');

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
