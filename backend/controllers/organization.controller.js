import Organization from "../models/organization.model.js";
import PortalSession from "../models/portalsession.model.js";
import OrganizationMember from "../models/orgmember.model.js";
import User from "../models/user.model.js";

import mongoose from "mongoose";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Remove top-level init
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get organizations where user is owner or member
export const getUserOrganizations = async (req, res) => {
    try {
        console.log("getUserOrganizations called");
        console.log("req.user object:", req.user);

        if (!req.user || !req.user._id) {
            console.error("User not found in request object!");
            return res.status(401).json({ message: "User not authenticated properly" });
        }

        const userIdStr = req.user._id.toString();
        let userIdObj;
        try {
            userIdObj = new mongoose.Types.ObjectId(userIdStr);
        } catch (e) {
            console.error("Invalid ObjectID conversion:", e);
        }

        console.log("Fetching orgs for user:", userIdStr);

        // 1. Find organizations created by user (Owned) - checking both exact match (if string) and casting
        const query = userIdObj ? { $or: [{ createdBy: userIdStr }, { createdBy: userIdObj }] } : { createdBy: userIdStr };
        const ownedOrgs = await Organization.find(query);
        console.log("Owned Orgs Found:", ownedOrgs.length);

        // 2. Find organizations where user is a member
        const memberships = await OrganizationMember.find({ userId: userIdStr }).populate('organizationId');
        console.log("Memberships Found:", memberships.length);

        // Extract orgs from memberships
        const memberOrgs = memberships
            .map(m => m.organizationId)
            .filter(org => org !== null); // safety check

        // Combine and deduplicate
        // Use a Map to deduplicate by _id
        const orgMap = new Map();

        ownedOrgs.forEach(org => {
            orgMap.set(org._id.toString(), { ...org.toObject(), role: 'owner' });
        });

        memberOrgs.forEach(org => {
            // changes role to 'member' if not already 'owner' (though owner usually is implicit)
            // But let's check if we want to preserve the specific role from membership if available??
            // For now, simplicity: if already in map (owned), keep as owner. If not, add as member.
            if (!orgMap.has(org._id.toString())) {
                orgMap.set(org._id.toString(), { ...org.toObject(), role: 'member' });
            }
        });

        const allOrgs = Array.from(orgMap.values());
        console.log("Total unique orgs returned:", allOrgs.length);

        res.status(200).json(allOrgs);

    } catch (error) {
        console.error("Error fetching user organizations:", error);
        res.status(500).json({ message: "Server error fetching your organizations" });
    }
};

export const getAllOrganizations = async (req, res) => {
    try {
        const organizations = await Organization.find({ isActive: true }).select("name _id");
        res.status(200).json(organizations);
    } catch (error) {
        console.error("Error fetching organizations:", error);
        res.status(500).json({ message: "Server error fetching organizations" });
    }
};

export const getOrganizationById = async (req, res) => {
    try {
        const { organizationId } = req.params;

        const organization = await Organization.findById(organizationId).select("name validationKeywords isActive isSetup rollNoLength createdBy");

        if (!organization) {
            return res.status(404).json({ message: "Organization not found" });
        }
        res.status(200).json(organization);
    } catch (error) {
        res.status(500).json({ message: "Error fetching organization details" });
    }
};

// verifyAccessCode and join organization
export const verifyAccessCode = async (req, res) => {
    const { organizationId, accessCode } = req.body;

    try {
        const organization = await Organization.findById(organizationId);
        if (!organization) {
            return res.status(404).json({ message: "Organization not found" });
        }

        const isValid = await organization.verifyAccessCode(accessCode);
        if (!isValid) {
            return res.status(401).json({ message: "Invalid access code" });
        }

        let userId = req.user ? req.user._id : null;

        // If user is logged in, create OrganizationMember and update User schema
        if (userId) {
            // Check if already a member
            const existingMember = await OrganizationMember.findOne({
                organizationId: organization._id,
                userId: userId
            });

            if (!existingMember) {
                await OrganizationMember.create({
                    organizationId: organization._id,
                    userId: userId,
                    role: 'staff' // Default role
                });
            }

            // Sync with User Schema (as requested)
            // Use $addToSet to avoid duplicates
            await User.findByIdAndUpdate(userId, {
                $addToSet: { joinedOrgs: organization._id }
            });
        }

        const session = await PortalSession.create({
            userId: userId,
            organizationId: organization._id,
        });

        res.status(200).json({
            message: "Access granted",
            sessionId: session._id,
            organization: {
                _id: organization._id,
                name: organization.name
            }
        });

    } catch (error) {
        console.error("Error verifying code:", error);
        res.status(500).json({ message: "Server error verifying code" });
    }
};

// Helper for manually creating org (since no UI yet)
// Updated to add creator as member (owner)
export const createOrganizationVal = async (req, res) => {
    try {
        const { name, accessCode } = req.body;
        const organization = new Organization({
            name,
            createdBy: req.user._id
        });
        await organization.setAccessCode(accessCode);
        await organization.save();

        // Create Owner Membership
        await OrganizationMember.create({
            organizationId: organization._id,
            userId: req.user._id,
            role: 'owner'
        });

        // Sync with User Schema
        await User.findByIdAndUpdate(req.user._id, {
            $addToSet: { createdOrgs: organization._id, joinedOrgs: organization._id }
        });

        res.status(201).json(organization);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}



// ... (previous code)

export const updateOrganizationSettings = async (req, res) => {
    try {
        const { organizationId } = req.params;
        const { validationKeywords, rollNoLength } = req.body;

        // Validate minimum keywords requirement
        if (validationKeywords && validationKeywords.length < 6) {
            return res.status(400).json({
                message: `At least 6 validation keywords are required for security. You provided ${validationKeywords.length}.`
            });
        }

        const organization = await Organization.findByIdAndUpdate(
            organizationId,
            {
                validationKeywords,
                rollNoLength,
                isSetup: validationKeywords && validationKeywords.length >= 6
            },
            { new: true, runValidators: true }
        );

        if (!organization) {
            return res.status(404).json({ message: "Organization not found" });
        }

        res.status(200).json(organization);
    } catch (error) {
        console.error("Error updating organization settings:", error);
        res.status(500).json({ message: error.message || "Error updating settings" });
    }
};

export const analyzeIdCard = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No image uploaded" });
        }

        if (!process.env.GEMINI_API_KEY) {
             console.error("GEMINI_API_KEY is missing in environment variables.");
             return res.status(500).json({ success: false, message: "Server misconfiguration: API Key missing" });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Using specific version as the base one returned 404
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
        Analyze this image to determine if it is a valid student ID card or organizational ID card.
        If it is a valid ID card, extract the following information in JSON format:
        1. "is_id_card": true/false
        2. "institution_name": "Exact Name of the institution/organization as written on the card"
        3. "confidence_score": (0-100) based on clarity and visibility
        4. "signature": {
            "keywords": ["List of 6-8 distinct, SINGLE words found on the card that act as unique static markers. RULES: 1. Do NOT include generic words like 'Indian', 'Institute', 'Technology', 'University', 'College', 'Card', 'Student', 'Of', 'The'. 2. PRIORITIZE specific location names (e.g., 'Roorkee', 'Mumbai'), unique acronyms (e.g., 'IIT', 'NIT'), or distinctive header/footer words (e.g., 'Welfare', 'Deptt', 'Enr'). 3. Exclude variable data (names, IDs). 4. Each keyword must be an EXACT substring found in the image."],
            "validation_signals": {
                "layout": "Brief description of layout (e.g., 'Portrait with blue header')",
                "security_features": "Any visible stamps, barcodes, or holograms"
            }
        }
        
        Return ONLY valid JSON. Do not use markdown code blocks.
        `;

        const imagePart = {
            inlineData: {
                data: req.file.buffer.toString("base64"),
                mimeType: req.file.mimetype,
            },
        };

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        // Clean up markdown if present
        const jsonStr = text.replace(/```json|```/g, "").trim();
        const analysis = JSON.parse(jsonStr);

        res.json({ success: true, analysis });

    } catch (error) {
        console.error("Gemini Vision Error:", error);
        res.status(500).json({ success: false, message: "AI Analysis failed", error: error.message });
    }
};

