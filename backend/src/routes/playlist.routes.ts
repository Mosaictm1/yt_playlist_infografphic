import { Router } from 'express';
import { playlistController } from '../controllers/index.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { apiKeysMiddleware } from '../middleware/apiKeys.middleware.js';

const router = Router();

// All routes require authentication and valid API keys
// POST /api/playlist/extract - Extract videos from playlist
router.post('/extract', authMiddleware, apiKeysMiddleware, (req, res) => playlistController.extractPlaylist(req, res));

// GET /api/playlist/:id - Get playlist with videos
router.get('/:id', authMiddleware, (req, res) => playlistController.getPlaylist(req, res));

// GET /api/playlists - Get all playlists
router.get('/', authMiddleware, (req, res) => playlistController.getAllPlaylists(req, res));

export default router;

