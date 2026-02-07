import { Router } from 'express';
import { submitFeedback } from '../controllers/feedback.controller.js';
import { authUser } from '../middleware/auth.middleware.js';

const router = Router();

// POST /api/feedback - Submit feedback (requires authentication)
router.post('/', authUser, submitFeedback);

export default router;
