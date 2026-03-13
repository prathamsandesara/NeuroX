const jwt = require('jsonwebtoken');
const { logSecurityEvent } = require('../services/auditService');

const authMiddleware = (req, res, next) => {


    try {
        const token = req.cookies.token;

        if (!token) {
            console.error(`[SECURITY EVENT] Unauthorized access attempt from IP: ${req.ip}`);
            logSecurityEvent('UNAUTHORIZED_ACCESS_NO_TOKEN', null, null, req.ip || req.headers['x-forwarded-for'], req.headers['user-agent'], { path: req.originalUrl }, 'MEDIUM');
            return res.status(401).json({ error: 'Unauthorized: No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error(`[SECURITY EVENT] Invalid Token Intrusion Attempt from IP: ${req.ip} | Error: ${error.message}`);
        logSecurityEvent('UNAUTHORIZED_ACCESS_INVALID_TOKEN', null, null, req.ip || req.headers['x-forwarded-for'], req.headers['user-agent'], { error: error.message, path: req.originalUrl }, 'CRITICAL');
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};

module.exports = authMiddleware;
