"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleMiddleware = void 0;
const roleMiddleware = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ ok: false, error: "Unauthorized access" });
        }
        const { role } = req.user;
        // Admin can bypass everything and access any module
        if (role === "Admin" || allowedRoles.includes(role)) {
            return next();
        }
        return res.status(403).json({
            ok: false,
            error: `Access Denied: Role '${role}' is not authorized to access this resource`
        });
    };
};
exports.roleMiddleware = roleMiddleware;
