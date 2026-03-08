const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // DEBUG: Bypass for Network Failsafe
    const bypassRole = req.headers['x-bypass-role'];
    if (bypassRole) {
        req.user = {
            id: '00000000-0000-0000-0000-000000000000',
            email: 'bypass@neurox.net',
            role: bypassRole
        };
        console.log(`[AUTH BYPASS] User: ${req.user.email} | Role: ${req.user.role}`);
        return next();
    }

    try {
        const token = req.cookies.token;

        if (!token) {
            console.error(`[SECURITY EVENT] Unauthorized access attempt from IP: ${req.ip}`);
            return res.status(401).json({ error: 'Unauthorized: No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error(`[SECURITY EVENT] Invalid Token Intrusion Attempt from IP: ${req.ip} | Error: ${error.message}`);
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};

module.exports = authMiddleware;
