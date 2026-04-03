const db = require('../config/db');

const getCandidates = async (req, res) => {
    try {
        const query = `
            SELECT 
                s.*,
                json_build_object('email', u.email, 'resume_url', u.resume_url) AS users,
                json_build_object(
                    'job_id', a.job_id,
                    'jobs', json_build_object('title', j.title)
                ) AS assessments
            FROM submissions s
            JOIN users u ON s.user_id = u.id
            JOIN assessments a ON s.assessment_id = a.id
            JOIN jobs j ON a.job_id = j.id
            ORDER BY s.completed_at DESC NULLS LAST
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
                           'jobs', json_build_object('title', j.title)
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
            return res.json(resultRows[0]);
        }

        // Fallback: If no result record, fetch submission directly
        const subQuery = `
            SELECT s.*,
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

const getHRStats = async (req, res) => {
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
        console.error('Error fetching HR stats:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
};

const logProctoringViolation = async (req, res) => {
    try {
        const { submissionId, violation } = req.body;
        
        const { rows } = await db.query('SELECT proctoring_violations FROM submissions WHERE id = $1', [submissionId]);
        const sub = rows[0];
        
        if (!sub) throw new Error('Submission not found');

        const currentViolations = typeof sub.proctoring_violations === 'string' ? JSON.parse(sub.proctoring_violations) : (sub.proctoring_violations || []);
        const updatedViolations = [...currentViolations, { ...violation, timestamp: new Date() }];

        await db.query(
            'UPDATE submissions SET proctoring_violations = $1 WHERE id = $2',
            [JSON.stringify(updatedViolations), submissionId]
        );

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
