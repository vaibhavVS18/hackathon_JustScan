import { Router } from "express";
import { getAllOrganizations, getOrganizationById, verifyAccessCode, createOrganizationVal, updateOrganizationSettings, getUserOrganizations, analyzeIdCard } from "../controllers/organization.controller.js";
import upload from "../middleware/upload.middleware.js";
import { addMember, removeMember, getOrganizationMembers, checkMembership } from "../controllers/membership.controller.js";
import { authUser, optionalAuthUser } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", getAllOrganizations);
router.post("/verify", optionalAuthUser, verifyAccessCode);
router.post("/analyze-id-card", upload.single('idCardImage'), analyzeIdCard);

// Temporary route to create orgs (protected)
router.post("/create", authUser, createOrganizationVal);

router.get("/my-organizations", authUser, getUserOrganizations);
router.get("/:organizationId/membership", authUser, checkMembership);
router.put("/:organizationId/settings", authUser, updateOrganizationSettings);
router.get("/:organizationId", authUser, getOrganizationById);
router.post("/:organizationId/members", authUser, addMember);
router.delete("/:organizationId/members/:memberId", authUser, removeMember);
router.get("/:organizationId/members", authUser, getOrganizationMembers);

export default router;
