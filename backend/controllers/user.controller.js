import { validationResult } from "express-validator";
import * as userService from "../services/user.service.js"
import userModel from "../models/user.model.js";
import redisClient from "../services/redis.service.js";
import OTPVerification from "../models/otp.model.js";
import { sendOTPEmail } from "../services/email.service.js";


export const createUserController = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const user = await userService.createUser(req.body);
        const token = await user.generateJWT();

        delete user._doc.password;
        res.status(201).json({ user, token });
    }
    catch (err) {
        res.status(400).send(err.message);
    }
}


export const loginUserController = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ erroes: errors.array() });
    }

    try {
        const user = await userService.loginUser(req.body);

        // Populate organization details
        await user.populate('createdOrgs');
        await user.populate('joinedOrgs');

        const token = await user.generateJWT();

        return res.status(200).json({ user, token });
    }
    catch (err) {
        res.status(400).send(err.message);
    }
}

export const ProfileController = async (req, res) => {
    try {
        const email = req.user.email;
        const user = await userModel.findOne({ email })
            .populate('createdOrgs')
            .populate('joinedOrgs');

        delete user._doc.password;
        res.status(200).json({ user: user });
    }
    catch (err) {
        res.status(400).send(err.message);
    }
}

export const logoutController = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        redisClient.set(token, "logout", "EX", 60 * 60 * 24);

        res.status(200).json({
            message: "logged out successfully"
        });
    }
    catch (err) {
        res.status(400).send(err.message);
    }
}

export const sendOTPController = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { email } = req.body;

        // Check if email already exists
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'Email already registered' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Delete any existing OTP for this email
        await OTPVerification.deleteMany({ email });

        // Store OTP in database
        await OTPVerification.create({
            email,
            otp,
            expiresAt,
        });

        // Send OTP email
        await sendOTPEmail(email, otp);

        res.status(200).json({
            success: true,
            message: 'OTP sent successfully to your email',
        });
    }
    catch (err) {
        console.error('Send OTP error:', err);
        res.status(500).json({ message: 'Failed to send OTP' });
    }
}

export const verifyOTPController = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { email, otp } = req.body;

        // Find the OTP record
        const otpRecord = await OTPVerification.findOne({
            email,
            otp,
            expiresAt: { $gt: new Date() } // Not expired
        });

        if (!otpRecord) {
            return res.status(401).json({ message: 'Invalid or expired OTP' });
        }

        // OTP is valid - don't delete it yet (will be deleted during signup)
        res.status(200).json({
            success: true,
            message: 'OTP verified successfully',
        });
    }
    catch (err) {
        console.error('Verify OTP error:', err);
        res.status(500).json({ message: 'Failed to verify OTP' });
    }
}
