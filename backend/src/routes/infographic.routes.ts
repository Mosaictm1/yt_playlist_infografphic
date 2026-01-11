import { Router } from 'express';
import { infographicController } from '../controllers/index.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { apiKeysMiddleware } from '../middleware/apiKeys.middleware.js';

const router = Router();

// All routes require authentication
// POST /api/infographic/generate - Start generation (requires API keys)
router.post('/generate', authMiddleware, apiKeysMiddleware, (req, res) => infographicController.generate(req, res));

// GET /api/infographic/job/:jobId - Get job status
router.get('/job/:jobId', authMiddleware, (req, res) => infographicController.getJobStatus(req, res));

// GET /api/infographic/jobs - Get all jobs for user (History)
router.get('/jobs', authMiddleware, (req, res) => infographicController.getUserJobs(req, res));

// GET /api/infographic/:videoId - Get infographic for video
router.get('/:videoId', authMiddleware, (req, res) => infographicController.getInfographic(req, res));

export default router;

