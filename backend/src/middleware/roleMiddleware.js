const roleMiddleware = (...roles) => {
    // Flatten the array to handle both `roleMiddleware('ADMIN')` and `roleMiddleware(['ADMIN', 'RECRUITER'])`
    const allowedRoles = roles.flat(Infinity);

    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
        }
        next();
    };
};

module.exports = roleMiddleware;
