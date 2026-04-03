const db = require('../config/db');
const crypto = require('crypto');

// Helper to generate a tamper-resistant hash for results
const generateIntegrityHash = (data) => {
    const secret = process.env.JWT_SECRET || 'neurox_kernel_v1';
    return crypto.createHmac('sha256', secret)
        .update(`${data.user_id}-${data.assessment_id}-${data.score}-${data.violationsCount}`)
        .digest('hex');
};

const getForensicLogs = async (req, res) => {
    try {
        // Fetch all users with security_metadata
        const { rows: users } = await db.query('SELECT * FROM users ORDER BY created_at DESC');

        // Fetch ALL submissions (not just ones with violations)
        const subQuery = `
            SELECT s.id, s.status, s.proctoring_violations, s.started_at, s.completed_at,
                   s.user_id, s.assessment_id, s.score,
                   json_build_object(
                       'id', a.id,
                       'job_id', a.job_id,
                       'jobs', json_build_object('title', j.title)
                   ) AS assessments
            FROM submissions s
            JOIN assessments a ON s.assessment_id = a.id
            JOIN jobs j ON a.job_id = j.id
            ORDER BY s.started_at DESC NULLS LAST
        `;
        const { rows: submissions } = await db.query(subQuery);

        let forensicData = [];

        // 1. Map Users as AUTH_SUCCESS baseline traffic
        users.forEach(u => {
            const meta = typeof u.security_metadata === 'string' ? JSON.parse(u.security_metadata) : (u.security_metadata || {});
            const loginHistory = meta.login_history || [];
            forensicData.push({
                id: `USER_LOG_${u.id}`,
                candidate: u.email,
                role: u.role,
                job: 'SYSTEM_AUTH',
                violationsCount: 0,
                violationBreakdown: {},
                score: 0,
                integrityScore: 100,
                riskIndex: 0,
                riskLevel: 'LOW',
                timestamp: u.created_at,
                lastLoginAt: meta.last_login_at || u.created_at,
                status: 'AUTH_SUCCESS',
                loginCount: loginHistory.length,
                loginHistory: loginHistory.slice(0, 3),
                sessionDuration: null,
                anomalyFlags: meta.failed_attempts > 0 ? ['FAILED_LOGIN_ATTEMPTS'] : [],
                biometrics: null,
                metadata: {
                    ip: meta.ip_address || 'UNAVAILABLE',
                    browser: meta.user_agent || 'UNKNOWN_CLIENT',
                    device_fingerprint: meta.device_fingerprint || null,
                    failed_attempts: meta.failed_attempts || 0,
                    lockout_until: meta.lockout_until || null,
                },
                integrityHash: generateIntegrityHash({
                    user_id: u.id, assessment_id: 'AUTH', score: 0, violationsCount: 0
                })
            });
        });

        // 2. Map Submissions as assessment session events with anomaly scoring
        submissions.forEach(sub => {
            const violations = typeof sub.proctoring_violations === 'string' ? JSON.parse(sub.proctoring_violations) : (sub.proctoring_violations || []);
            const user = users.find(u => u.id === sub.user_id);
            const meta = user ? (typeof user.security_metadata === 'string' ? JSON.parse(user.security_metadata) : (user.security_metadata || {})) : {};

            // Session duration
            let sessionDuration = null;
            if (sub.started_at && sub.completed_at) {
                sessionDuration = Math.round((new Date(sub.completed_at) - new Date(sub.started_at)) / 60000);
            }

            // Violation type breakdown
            const violationBreakdown = {};
            violations.forEach(v => {
                violationBreakdown[v.type] = (violationBreakdown[v.type] || 0) + 1;
            });

            // Anomaly detection
            const anomalyFlags = [];
            if (sub.score > 85 && sessionDuration !== null && sessionDuration < 5) {
                anomalyFlags.push('SUSPICIOUSLY_FAST_COMPLETION');
            }
            if ((violationBreakdown['COPY_PASTE_ATTEMPT'] || 0) > 0) anomalyFlags.push('COPY_PASTE_DETECTED');
            if ((violationBreakdown['HOTKEY_BYPASS_ATTEMPT'] || 0) > 0) anomalyFlags.push('HOTKEY_BYPASS_DETECTED');
            if ((violationBreakdown['TAB_SWITCH_OR_NOTIFICATION'] || 0) > 2) anomalyFlags.push('REPEATED_FOCUS_LOSS');
            if (meta.failed_attempts > 2) anomalyFlags.push('FAILED_LOGIN_ATTEMPTS');

            let riskIndex = Math.min(violations.length * 15 + anomalyFlags.length * 10, 100);
            let riskLevel = riskIndex > 70 ? 'CRITICAL' : riskIndex > 40 ? 'MEDIUM' : riskIndex > 0 ? 'LOW' : 'CLEAR';
            const lastViolation = violations[violations.length - 1];

            forensicData.push({
                id: sub.id,
                candidate: user?.email || 'UNKNOWN_SUBJECT',
                role: user?.role || 'CANDIDATE',
                job: sub.assessments?.jobs?.title || 'UNKNOWN_NODE',
                violationsCount: violations.length,
                violationBreakdown,
                score: sub.score || 0,
                integrityScore: 100 - riskIndex,
                riskIndex,
                riskLevel,
                timestamp: sub.started_at,
                lastLoginAt: meta.last_login_at || null,
                status: sub.status,
                loginCount: (meta.login_history || []).length,
                loginHistory: (meta.login_history || []).slice(0, 3),
                sessionDuration,
                anomalyFlags,
                biometrics: lastViolation?.biometrics || null,
                metadata: {
                    ip: meta.ip_address || 'UNAVAILABLE',
                    browser: meta.user_agent || 'UNKNOWN_CLIENT',
                    device_fingerprint: meta.device_fingerprint || null,
                    failed_attempts: meta.failed_attempts || 0,
                },
                integrityHash: generateIntegrityHash({
                    user_id: sub.user_id,
                    assessment_id: sub.assessment_id,
                    score: sub.score,
                    violationsCount: violations.length
                })
            });
        });

        forensicData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        res.json(forensicData);
    } catch (error) {
        console.error('Forensic Fetch Error:', error);
        res.status(500).json({ error: 'Failed to fetch forensic data' });
    }
};

const getAuditLogs = async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM security_audit_log ORDER BY created_at DESC LIMIT 100');
        res.json(rows || []);
    } catch (error) {
        console.error('Audit Fetch Exception (table might not exist yet):', error);
        res.json([]); // return empty if not provisioned
    }
};

const logAudit = async (req, res) => {
    try {
        const { action, resourceId, details } = req.body;
        const adminId = req.user.id;

        const logDetails = {
            type: 'RBAC_AUDIT',
            action,
            resource_id: resourceId,
            ip: req.ip,
            timestamp: new Date().toISOString(),
            ...details
        };

        await db.query(
            'INSERT INTO integrity_logs (user_id, risk_level, details) VALUES ($1, $2, $3)',
            [adminId, 'AUDIT', JSON.stringify(logDetails)]
        );

        res.json({ message: 'Audit log captured' });
    } catch (error) {
        console.error('Audit Log Error:', error);
        res.status(500).json({ error: 'Failed to capture audit log' });
    }
};

const getSystemStats = async (req, res) => {
    try {
        console.log('[Admin] Fetching system statistics...');
        
        const { rows: uRows } = await db.query('SELECT COUNT(*) FROM users');
        const { rows: jRows } = await db.query('SELECT COUNT(*) FROM jobs');
        const { rows: sRows } = await db.query('SELECT COUNT(*) FROM submissions');

        const userCount = parseInt(uRows[0].count, 10);
        const jobCount = parseInt(jRows[0].count, 10);
        const submissionCount = parseInt(sRows[0].count, 10);

        console.log('[Admin] Stats retrieved:', { userCount, jobCount, submissionCount });

        res.json({
            totalUsers: userCount || 0,
            activeJobs: jobCount || 0,
            totalAssessments: submissionCount || 0,
            systemStatus: 'OPERATIONAL'
        });
    } catch (error) {
        console.error('[Admin] Stats Fetch Error:', error);
        res.status(500).json({ error: 'Stats Error' });
    }
};

const resetCandidateAttempt = async (req, res) => {
    try {
        const { submissionId } = req.body;
        
        const { rows } = await db.query(
            'UPDATE submissions SET attempts_left = 1, status = $1, completed_at = NULL, score = NULL, result_generated = false WHERE id = $2 RETURNING *',
            ['IN_PROGRESS', submissionId]
        );
        
        res.json({ message: 'Candidate attempt reset successfully', data: rows });
    } catch (error) {
        console.error('Reset Attempt Error:', error);
        res.status(500).json({ error: 'Failed to reset attempt' });
    }
};

const deleteAssessment = async (req, res) => {
    try {
        const { id: assessmentId } = req.params;

        console.log(`[Admin] Initiating purge for Assessment: ${assessmentId}`);

        // 0. Get job_id for full mission purge
        const { rows } = await db.query('SELECT job_id FROM assessments WHERE id = $1', [assessmentId]);
        const assessment = rows[0];

        if (!assessment) {
            return res.status(404).json({ error: 'Assessment not found' });
        }

        const jobId = assessment.job_id;

        // 1. Delete associated questions
        await db.query('DELETE FROM questions WHERE assessment_id = $1', [assessmentId]);

        // 2. Delete associated submissions
        await db.query('DELETE FROM submissions WHERE assessment_id = $1', [assessmentId]);

        // 3. Delete the assessment itself
        await db.query('DELETE FROM assessments WHERE id = $1', [assessmentId]);

        // 4. Delete the Job itself (Full Purge)
        if (jobId) {
            await db.query('DELETE FROM jobs WHERE id = $1', [jobId]);
        }

        res.json({ message: 'MISSION_PURGED_SUCCESSFULLY' });
    } catch (error) {
        console.error('Purge error:', error);
        res.status(500).json({ error: 'Failed to purge assessment data' });
    }
};

module.exports = {
    getForensicLogs,
    getAuditLogs,
    logAudit,
    getSystemStats,
    resetCandidateAttempt,
    deleteAssessment
};
