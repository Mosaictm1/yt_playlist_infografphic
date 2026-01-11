import { Router, Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Get current user info
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
    try {
        const user = req.user!;

        res.json({
            success: true,
            data: {
                id: user.id,
                email: user.email,
                name: user.name,
                plan: user.plan,
                hasApiKeys: {
                    apifyApiToken: !!user.apifyApiToken,
                    geminiApiKey: !!user.geminiApiKey,
                    atlasCloudApiKey: !!user.atlasCloudApiKey,
                },
            },
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get user info',
        });
    }
});

// Update user API keys (for FREE plan users)
router.put('/api-keys', authMiddleware, async (req: Request, res: Response) => {
    try {
        const user = req.user!;
        const { apifyApiToken, geminiApiKey, atlasCloudApiKey } = req.body;

        // Update user's API keys
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                apifyApiToken: apifyApiToken || null,
                geminiApiKey: geminiApiKey || null,
                atlasCloudApiKey: atlasCloudApiKey || null,
            },
        });

        res.json({
            success: true,
            message: 'API keys updated successfully',
            data: {
                hasApiKeys: {
                    apifyApiToken: !!updatedUser.apifyApiToken,
                    geminiApiKey: !!updatedUser.geminiApiKey,
                    atlasCloudApiKey: !!updatedUser.atlasCloudApiKey,
                },
            },
        });
    } catch (error) {
        console.error('Update API keys error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update API keys',
        });
    }
});

// Update user profile
router.put('/profile', authMiddleware, async (req: Request, res: Response) => {
    try {
        const user = req.user!;
        const { name } = req.body;

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: { name },
        });

        res.json({
            success: true,
            data: {
                id: updatedUser.id,
                email: updatedUser.email,
                name: updatedUser.name,
                plan: updatedUser.plan,
            },
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update profile',
        });
    }
});

export default router;
