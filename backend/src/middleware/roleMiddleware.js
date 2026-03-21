const roleMiddleware = (...roles) => {
    // Flatten the array to handle both `roleMiddleware('ADMIN')` and `roleMiddleware(['ADMIN', 'RECRUITER'])`
    const allowedRoles = roles.flat(Infinity).map(r => String(r).toUpperCase());

    return (req, res, next) => {
        const userRole = String(req.user?.role || "").toUpperCase();
        console.log(`[RBAC_CHECK] Path: ${req.path} | User: ${req.user?.email} | Role: ${userRole} | Allowed: ${JSON.stringify(allowedRoles)}`);
        
        if (!req.user || !allowedRoles.includes(userRole)) {
            console.warn(`[RBAC_DENIED] No match for ${userRole} in ${JSON.stringify(allowedRoles)}`);
            return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
        }
        next();
    };
};

module.exports = roleMiddleware;
