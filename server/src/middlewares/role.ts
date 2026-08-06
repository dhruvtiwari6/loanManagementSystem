import { Response, NextFunction } from "express";
import { IAuthRequest } from "./auth";

export const roleMiddleware = (allowedRoles: string[]) => {
  return (req: IAuthRequest, res: Response, next: NextFunction) => {
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
