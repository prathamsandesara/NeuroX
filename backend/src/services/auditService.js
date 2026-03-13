const supabase = require('../config/supabase');

const logSecurityEvent = async (eventType, userId, email, ipAddress, userAgent, details, riskLevel = 'LOW') => {
    try {
        const { error } = await supabase
            .from('security_audit_log')
            .insert([{
                event_type: eventType,
                user_id: userId || null,
                email: email || null,
                ip_address: ipAddress || 'UNKNOWN',
                user_agent: userAgent || 'UNKNOWN',
                details: details || {},
                risk_level: riskLevel
            }]);
            
        if (error) {
            console.error('[AUDIT_LOG_DB_ERROR]', error);
        } else {
            console.log(`[AUDIT_LOG] Event: ${eventType} | IP: ${ipAddress} | Risk: ${riskLevel}`);
        }
    } catch (err) {
        console.error('[AUDIT_LOG_EXCEPTION]', err);
    }
};

module.exports = { logSecurityEvent };
