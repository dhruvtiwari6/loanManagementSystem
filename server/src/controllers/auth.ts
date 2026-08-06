import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { IAuthRequest } from "../middlewares/auth";

const JWT_SECRET = process.env.JWT_SECRET || "creditsea-default-jwt-secret-key-12345";

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ ok: false, error: "Please provide name, email, and password" });
  }

  try {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ ok: false, error: "User with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "Borrower" // Normal registration defaults to Borrower
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    return res.status(201).json({
      ok: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err: any) {
    console.error("Registration error:", err.message);
    return res.status(500).json({ ok: false, error: "Server registration error" });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ ok: false, error: "Please provide email and password" });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.password) {
      return res.status(400).json({ ok: false, error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ ok: false, error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    return res.json({
      ok: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        borrowerProfile: user.borrowerProfile
      }
    });
  } catch (err: any) {
    console.error("Login error:", err.message);
    return res.status(500).json({ ok: false, error: "Server login error" });
  }
};

export const getMe = async (req: IAuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ ok: false, error: "Not authenticated" });
  }

  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ ok: false, error: "User not found" });
    }
    return res.json({ ok: true, user });
  } catch (err: any) {
    console.error("GetMe error:", err.message);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
};
