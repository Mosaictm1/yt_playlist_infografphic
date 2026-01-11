import { Request, Response } from 'express';
import { infographicService } from '../services/index.js';
import { z } from 'zod';

const generateSchema = z.object({
    playlistId: z.string().uuid(),
    videoIds: z.array(z.string().uuid()).min(1, 'At least one video must be selected'),
});

export class InfographicController {
    /**
     * POST /api/infographic/generate
     * Start infographic generation for selected videos
     */
    async generate(req: Request, res: Response) {
        try {
            const { playlistId, videoIds } = generateSchema.parse(req.body);

            // Get API keys from middleware (based on user plan)
            const apiKeys = req.apiKeys;
            if (!apiKeys?.geminiApiKey || !apiKeys?.atlasCloudApiKey) {
                return res.status(403).json({
                    success: false,
                    error: 'API keys required',
                    message: 'Gemini و Atlas Cloud مفاتيح مطلوبة لإنشاء Infographics',
                });
            }

            const job = await infographicService.createJob(playlistId, videoIds, {
                geminiApiKey: apiKeys.geminiApiKey,
                atlasCloudApiKey: apiKeys.atlasCloudApiKey,
            });

            res.status(202).json({
                success: true,
                data: {
                    jobId: job.id,
                    status: job.status,
                    totalVideos: videoIds.length,
                    progress: 0,
                },
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid request',
                    details: error.errors,
                });
            }

            console.error('Error starting generation:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to start infographic generation',
            });
        }
    }

    /**
     * GET /api/infographic/job/:jobId
     * Get processing job status
     */
    async getJobStatus(req: Request, res: Response) {
        try {
            const { jobId } = req.params;

            const job = await infographicService.getJobStatus(jobId);

            if (!job) {
                return res.status(404).json({
                    success: false,
                    error: 'Job not found',
                });
            }

            res.status(200).json({
                success: true,
                data: job,
            });
        } catch (error) {
            console.error('Error getting job status:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get job status',
            });
        }
    }

    /**
     * GET /api/infographic/:videoId
     * Get infographic for a specific video
     */
    async getInfographic(req: Request, res: Response) {
        try {
            const { videoId } = req.params;

            const infographic = await infographicService.getInfographicByVideoId(videoId);

            if (!infographic) {
                return res.status(404).json({
                    success: false,
                    error: 'Infographic not found',
                });
            }

            res.status(200).json({
                success: true,
                data: infographic,
            });
        } catch (error) {
            console.error('Error getting infographic:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get infographic',
            });
        }
    }

    /**
     * GET /api/playlist/:playlistId/infographics
     * Get all infographics for a playlist
     */
    async getPlaylistInfographics(req: Request, res: Response) {
        try {
            const { playlistId } = req.params;

            const infographics = await infographicService.getPlaylistInfographics(playlistId);

            res.status(200).json({
                success: true,
                data: infographics,
            });
        } catch (error) {
            console.error('Error getting playlist infographics:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get playlist infographics',
            });
        }
    }
}

export const infographicController = new InfographicController();
