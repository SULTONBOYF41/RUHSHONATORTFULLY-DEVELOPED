const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/env');

// Oddiy auth middleware
function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization || '';

    if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token berilmagan' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const payload = jwt.verify(token, jwtSecret);
        // payload: { id, role, branchId, iat, exp }
        req.user = {
            id: payload.id,
            role: payload.role,
            branchId: payload.branchId || null,
        };
        next();
    } catch (err) {
        console.error('JWT verify error:', err.message);
        return res.status(401).json({ message: 'Token noto‘g‘ri yoki eskirgan' });
    }
}

// Ro‘l bo‘yicha cheklash
function requireRole(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Ruxsat etilmagan' });
        }
        next();
    };
}

module.exports = {
    requireAuth,
    requireRole,
};
