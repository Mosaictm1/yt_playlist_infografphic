import express from 'express';
import cors from 'cors';
import { env, validateEnv } from './config/env.js';
import playlistRoutes from './routes/playlist.routes.js';
import infographicRoutes from './routes/infographic.routes.js';
import authRoutes from './routes/auth.routes.js';
import { infographicController } from './controllers/index.js';

// Validate environment variables
validateEnv();

const app = express();

// Middleware
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? ['https://yt-playlist-infografphic.vercel.app', 'https://yt-playlist-infografphic-*.vercel.app']
        : ['http://localhost:3001', 'http://localhost:5173'],
    credentials: true,
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/playlist', playlistRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/infographic', infographicRoutes);

// Get playlist infographics (special route)
app.get('/api/playlist/:playlistId/infographics', (req, res) =>
    infographicController.getPlaylistInfographics(req, res)
);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
    });
});

// Start server
const PORT = env.PORT;

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Environment: ${env.NODE_ENV}`);
});

export default app;
