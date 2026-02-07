import userModel from "../models/user.model.js";
import OTPVerification from "../models/otp.model.js";

export const createUser = async ({ email, password, otp }) => {
    if (!email || !password) {
        throw new Error("Email and password are required");
    }

    if (!otp) {
        throw new Error("OTP is required for signup");
    }

    // checking for duplicate email
    const existingUser = await userModel.findOne({ email });
    console.log(existingUser);
    if (existingUser) {
        const error = new Error("Email already registered");
        error.statusCode = 409;
        throw error;
    }

    // Verify OTP
    const otpRecord = await OTPVerification.findOne({
        email,
        otp,
        expiresAt: { $gt: new Date() } // Not expired
    });

    if (!otpRecord) {
        const error = new Error("Invalid or expired OTP");
        error.statusCode = 401;
        throw error;
    }

    const hashedPassword = await userModel.hashPassword(password);

    const user = await userModel.create({
        email,
        password: hashedPassword
    });

    // Delete the OTP record after successful verification
    await OTPVerification.deleteOne({ _id: otpRecord._id });

    return user;
}


export const loginUser = async ({ email, password }) => {
    if (!email || !password) {
        throw new Error("Email and password are required");
    }

    const user = await userModel.findOne({ email });
    if (!user) {
        throw new Error("user not found");
    }

    const isMatch = await user.isValidPassword(password);
    if (!isMatch) {
        throw new Error("Invalid credentials");
    }

    return user;
}