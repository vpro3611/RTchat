"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const authMiddleware = (jwtService) => {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const [type, token] = authHeader.split(' ');
        if (type !== "Bearer" || !token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        try {
            const payload = jwtService.verifyAccessToken(token);
            req.user = payload;
            next();
        }
        catch (error) {
            return res.status(401).json({ message: 'Invalid or expired token' });
        }
    };
};
exports.authMiddleware = authMiddleware;
