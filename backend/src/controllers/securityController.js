const db = require('../config/db');

// Get real-time security events for the dashboard
const getSecurityEvents = async (req, res) => {
    try {
        const query = `
            SELECT i.*, 
                   json_build_object('email', u.email) AS users
            FROM integrity_logs i
            JOIN users u ON i.user_id = u.id
            ORDER BY i.created_at DESC
            LIMIT 50
        `;
        const { rows } = await db.query(query);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching security events:', error);
        res.status(500).json({ error: 'Failed to fetch security events' });
    }
};

// Get aggregated security metrics
const getSecurityMetrics = async (req, res) => {
    try {
        const { rows: logs } = await db.query('SELECT risk_level FROM integrity_logs');

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
