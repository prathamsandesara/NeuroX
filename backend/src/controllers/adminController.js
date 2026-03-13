const supabase = require('../config/supabase');
const crypto = require('crypto');

// Helper to generate a tamper-resistant hash for results
const generateIntegrityHash = (data) => {
    const secret = process.env.JWT_SECRET || 'neurox_kernel_v1';
    return crypto.createHmac('sha256', secret)
        .update(`${data.user_id}-${data.assessment_id}-${data.score}-${data.violationsCount}`)
        .digest('hex');
};

exports.getForensicLogs = async (req, res) => {
    try {
        // Fetch all users with security_metadata
        const { data: users, error: userError } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });
        if (userError) throw userError;

        // Fetch ALL submissions (not just ones with violations)
        const { data: submissions, error: subError } = await supabase
            .from('submissions')
            .select(`
                id, status, proctoring_violations, started_at, completed_at,
                user_id, assessment_id, score,
                assessments (id, job_id, jobs (title))
            `)
            .order('started_at', { ascending: false });
        if (subError) throw subError;

        let forensicData = [];

        // 1. Map Users as AUTH_SUCCESS baseline traffic
        users.forEach(u => {
            const meta = u.security_metadata || {};
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
            const violations = sub.proctoring_violations || [];
            const user = users.find(u => u.id === sub.user_id);
            const meta = user?.security_metadata || {};

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

exports.getAuditLogs = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('security_audit_log')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);
            
        if (error) {
            console.error('Audit fetch error (table might not exist yet):', error);
            return res.json([]); // return empty if not provisioned
        }

        res.json(data || []);
    } catch (error) {
        console.error('Audit Fetch Exception:', error);
        res.status(500).json({ error: 'Failed' });
    }
};

exports.logAudit = async (req, res) => {
    try {
        const { action, resourceId, details } = req.body;
        const adminId = req.user.id;

        const { error } = await supabase.from('integrity_logs').insert([{
            user_id: adminId,
            risk_level: 'AUDIT',
            details: {
                type: 'RBAC_AUDIT',
                action,
                resource_id: resourceId,
                ip: req.ip,
                timestamp: new Date().toISOString(),
                ...details
            }
        }]);

        if (error) throw error;
        res.json({ message: 'Audit log captured' });
    } catch (error) {
        console.error('Audit Log Error:', error);
        res.status(500).json({ error: 'Failed to capture audit log' });
    }
};

exports.getSystemStats = async (req, res) => {
    try {
        console.log('[Admin] Fetching system statistics...');
        const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
        const { count: jobCount } = await supabase.from('jobs').select('*', { count: 'exact', head: true });
        const { count: submissionCount } = await supabase.from('submissions').select('*', { count: 'exact', head: true });

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
