import { Router } from 'express';
import { infographicController } from '../controllers/index.js';

const router = Router();

// POST /api/infographic/generate - Start generation
router.post('/generate', (req, res) => infographicController.generate(req, res));

// GET /api/infographic/job/:jobId - Get job status
router.get('/job/:jobId', (req, res) => infographicController.getJobStatus(req, res));

// GET /api/infographic/:videoId - Get infographic for video
router.get('/:videoId', (req, res) => infographicController.getInfographic(req, res));

export default router;
