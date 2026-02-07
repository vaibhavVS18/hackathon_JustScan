import { Router } from "express";
import { getStudents, createStudent, getStudent, updateStudent, bulkUploadStudents, deleteStudent, getRollNumbers } from "../controllers/student.controller.js";
import { requirePortalSession } from "../middleware/portal.middleware.js";
import multer from "multer";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// All student routes require a valid portal session (organization context)
router.use(requirePortalSession);

router.post("/bulk-upload", upload.single("file"), bulkUploadStudents);
router.get("/roll-numbers", getRollNumbers);
router.get("/", getStudents);
router.post("/", createStudent);
router.get("/:rollNo", getStudent);
router.put("/:rollNo", updateStudent);
router.delete("/:rollNo", deleteStudent);

export default router;
