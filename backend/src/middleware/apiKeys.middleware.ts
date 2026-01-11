import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';

// Extend Express Request to include resolved API keys
declare global {
    namespace Express {
        interface Request {
            apiKeys?: {
                apifyApiToken?: string;
                geminiApiKey?: string;
                atlasCloudApiKey?: string;
            };
        }
    }
}

/**
 * Middleware for playlist operations - only requires Apify key
 */
export const playlistApiKeysMiddleware = async (
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
            };
            return next();
        }

        // FREE users must have Apify key
        if (!user.apifyApiToken) {
            return res.status(403).json({
                success: false,
                error: 'API key required',
                message: 'الخطة المجانية تتطلب إدخال Apify API Token في الإعدادات',
                missingKeys: {
                    apifyApiToken: true,
                },
            });
        }

        req.apiKeys = {
            apifyApiToken: user.apifyApiToken,
        };

        next();
    } catch (error) {
        console.error('Playlist API keys middleware error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to resolve API keys',
        });
    }
};

/**
 * Middleware for infographic generation - requires all keys
 */
export const infographicApiKeysMiddleware = async (
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

        // FREE users must have all keys
        const missingKeys = {
            apifyApiToken: !user.apifyApiToken,
            geminiApiKey: !user.geminiApiKey,
            atlasCloudApiKey: !user.atlasCloudApiKey,
        };

        if (missingKeys.apifyApiToken || missingKeys.geminiApiKey || missingKeys.atlasCloudApiKey) {
            return res.status(403).json({
                success: false,
                error: 'API keys required',
                message: 'الخطة المجانية تتطلب إدخال جميع API keys في الإعدادات لإنشاء الـ Infographics',
                missingKeys,
            });
        }

        req.apiKeys = {
            apifyApiToken: user.apifyApiToken!,
            geminiApiKey: user.geminiApiKey!,
            atlasCloudApiKey: user.atlasCloudApiKey!,
        };

        next();
    } catch (error) {
        console.error('Infographic API keys middleware error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to resolve API keys',
        });
    }
};

// Keep old name for backward compatibility
export const apiKeysMiddleware = infographicApiKeysMiddleware;
