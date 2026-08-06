"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const JWT_SECRET = process.env.JWT_SECRET || "creditsea-default-jwt-secret-key-12345";
const register = async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ ok: false, error: "Please provide name, email, and password" });
    }
    try {
        const existingUser = await User_1.User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ ok: false, error: "User with this email already exists" });
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const user = new User_1.User({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: "Borrower" // Normal registration defaults to Borrower
        });
        await user.save();
        const token = jsonwebtoken_1.default.sign({ id: user._id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: "24h" });
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
    }
    catch (err) {
        console.error("Registration error:", err.message);
        return res.status(500).json({ ok: false, error: "Server registration error" });
    }
};
exports.register = register;
const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ ok: false, error: "Please provide email and password" });
    }
    try {
        const user = await User_1.User.findOne({ email: email.toLowerCase() });
        if (!user || !user.password) {
            return res.status(400).json({ ok: false, error: "Invalid email or password" });
        }
        const isMatch = await bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ ok: false, error: "Invalid email or password" });
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: "24h" });
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
    }
    catch (err) {
        console.error("Login error:", err.message);
        return res.status(500).json({ ok: false, error: "Server login error" });
    }
};
exports.login = login;
const getMe = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ ok: false, error: "Not authenticated" });
    }
    try {
        const user = await User_1.User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({ ok: false, error: "User not found" });
        }
        return res.json({ ok: true, user });
    }
    catch (err) {
        console.error("GetMe error:", err.message);
        return res.status(500).json({ ok: false, error: "Server error" });
    }
};
exports.getMe = getMe;
