import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';

// Extend Express Request to include resolved API keys
declare global {
    namespace Express {
        interface Request {
            apiKeys?: {
                apifyApiToken: string;
                geminiApiKey: string;
                atlasCloudApiKey: string;
            };
        }
    }
}

/**
 * Middleware to resolve API keys based on user plan:
 * - PAID users: Use system-level environment keys
 * - FREE users: Use their own keys (must have them configured)
 */
export const apiKeysMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required',
            });
        }

        // PAID users use system keys
        if (user.plan === 'PAID') {
            req.apiKeys = {
                apifyApiToken: env.APIFY_API_TOKEN,
                geminiApiKey: env.GEMINI_API_KEY,
                atlasCloudApiKey: env.ATLAS_CLOUD_API_KEY,
            };
            return next();
        }

        // FREE users must have their own keys
        if (!user.apifyApiToken || !user.geminiApiKey || !user.atlasCloudApiKey) {
            return res.status(403).json({
                success: false,
                error: 'API keys required',
                message: 'الخطة المجانية تتطلب إدخال API keys الخاصة بك في الإعدادات',
                missingKeys: {
                    apifyApiToken: !user.apifyApiToken,
                    geminiApiKey: !user.geminiApiKey,
                    atlasCloudApiKey: !user.atlasCloudApiKey,
                },
            });
        }

        req.apiKeys = {
            apifyApiToken: user.apifyApiToken,
            geminiApiKey: user.geminiApiKey,
            atlasCloudApiKey: user.atlasCloudApiKey,
        };

        next();
    } catch (error) {
        console.error('API keys middleware error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to resolve API keys',
        });
    }
};
