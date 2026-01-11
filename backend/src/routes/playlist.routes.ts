import { Router } from 'express';
import { playlistController } from '../controllers/index.js';

const router = Router();

// POST /api/playlist/extract - Extract videos from playlist
router.post('/extract', (req, res) => playlistController.extractPlaylist(req, res));

// GET /api/playlist/:id - Get playlist with videos
router.get('/:id', (req, res) => playlistController.getPlaylist(req, res));

// GET /api/playlists - Get all playlists
router.get('/', (req, res) => playlistController.getAllPlaylists(req, res));

export default router;
