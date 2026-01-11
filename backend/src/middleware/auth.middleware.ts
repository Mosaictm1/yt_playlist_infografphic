import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '../config/database.js';

// Extend Express Request type
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                supabaseId: string;
                email: string;
                name: string | null;
                plan: 'FREE' | 'PAID';
                apifyApiToken: string | null;
                geminiApiKey: string | null;
                atlasCloudApiKey: string | null;
            };
        }
    }
}

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
);

export const authMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Authorization token required',
            });
        }

        const token = authHeader.split(' ')[1];

        // Verify token with Supabase
        const { data: { user: supabaseUser }, error } = await supabase.auth.getUser(token);

        if (error || !supabaseUser) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired token',
            });
        }

        // Find or create user in our database
        let user = await prisma.user.findUnique({
            where: { supabaseId: supabaseUser.id },
        });

        if (!user) {
            // Create user on first login
            user = await prisma.user.create({
                data: {
                    supabaseId: supabaseUser.id,
                    email: supabaseUser.email!,
                    name: supabaseUser.user_metadata?.full_name || null,
                    plan: 'FREE',
                },
            });
        }

        // Attach user to request
        req.user = {
            id: user.id,
            supabaseId: user.supabaseId,
            email: user.email,
            name: user.name,
            plan: user.plan,
            apifyApiToken: user.apifyApiToken,
            geminiApiKey: user.geminiApiKey,
            atlasCloudApiKey: user.atlasCloudApiKey,
        };

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            error: 'Authentication failed',
        });
    }
};

// Optional auth - doesn't fail if no token, just sets user if present
export const optionalAuthMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }

        const token = authHeader.split(' ')[1];
        const { data: { user: supabaseUser }, error } = await supabase.auth.getUser(token);

        if (!error && supabaseUser) {
            const user = await prisma.user.findUnique({
                where: { supabaseId: supabaseUser.id },
            });

            if (user) {
                req.user = {
                    id: user.id,
                    supabaseId: user.supabaseId,
                    email: user.email,
                    name: user.name,
                    plan: user.plan,
                    apifyApiToken: user.apifyApiToken,
                    geminiApiKey: user.geminiApiKey,
                    atlasCloudApiKey: user.atlasCloudApiKey,
                };
            }
        }

        next();
    } catch (error) {
        // Silently fail for optional auth
        next();
    }
};
