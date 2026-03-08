const supabase = require('../config/supabase');

// Get real-time security events for the dashboard
const getSecurityEvents = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('integrity_logs')
            .select('*, users(email)')
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Error fetching security events:', error);
        res.status(500).json({ error: 'Failed to fetch security events' });
    }
};

// Get aggregated security metrics
const getSecurityMetrics = async (req, res) => {
    try {
        const { data: logs, error } = await supabase
            .from('integrity_logs')
            .select('risk_level');

        if (error) throw error;

        const metrics = {
            total_violations: logs.length,
            high_risk: logs.filter(l => l.risk_level === 'HIGH' || l.risk_level === 'CRITICAL').length,
            medium_risk: logs.filter(l => l.risk_level === 'MEDIUM').length,
            low_risk: logs.filter(l => l.risk_level === 'LOW').length,
            active_threats: logs.filter(l => l.risk_level === 'CRITICAL').length // Simulated active threats
        };

        res.json(metrics);
    } catch (error) {
        console.error('Error fetching security metrics:', error);
        res.status(500).json({ error: 'Failed to fetch security metrics' });
    }
};

module.exports = { getSecurityEvents, getSecurityMetrics };
