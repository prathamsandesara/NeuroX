const db = require('../config/db');

const logSecurityEvent = async (eventType, userId, email, ipAddress, userAgent, details, riskLevel = 'LOW') => {
    try {
        await db.query(
            `INSERT INTO security_audit_log 
            (event_type, user_id, email, ip_address, user_agent, details, risk_level) 
            VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
                eventType,
                userId || null,
                email || null,
                ipAddress || 'UNKNOWN',
                userAgent || 'UNKNOWN',
                details || {},
                riskLevel
            ]
        );
            
        console.log(`[AUDIT_LOG] Event: ${eventType} | IP: ${ipAddress} | Risk: ${riskLevel}`);
    } catch (err) {
        console.error('[AUDIT_LOG_EXCEPTION]', err);
    }
};

module.exports = { logSecurityEvent };
