import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "creditsea-default-jwt-secret-key-12345";

export interface IAuthUser {
  id: string;
  role: "Borrower" | "Sales" | "Sanction" | "Disbursement" | "Collection" | "Admin";
  email: string;
}

export interface IAuthRequest extends Request {
  user?: IAuthUser;
  file?: any;
  files?: any;
}

export const authMiddleware = (req: IAuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ ok: false, error: "Access token required" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as IAuthUser;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ ok: false, error: "Invalid or expired access token" });
  }
};
