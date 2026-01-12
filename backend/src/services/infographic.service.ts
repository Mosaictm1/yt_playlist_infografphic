import prisma from '../config/prisma.js';
import { transcriptService } from './transcript.service.js';
import { aiAnalysisService } from './ai-analysis.service.js';
import { imageGenerationService } from './image-generation.service.js';
import { Status } from '@prisma/client';

// Interface for API keys passed from middleware
export interface ApiKeys {
    geminiApiKey: string;
    atlasCloudApiKey: string;
}

// Interface for infographic customization options
export interface InfographicOptions {
    language: 'ar' | 'en';
    orientation: 'landscape' | 'portrait' | 'square';
    detailLevel: 'concise' | 'standard' | 'detailed';
    customDescription?: string;
}

export class InfographicService {
    // In-memory storage for job API keys (cleared after job completes)
    private jobApiKeys: Map<string, ApiKeys> = new Map();
    private jobOptions: Map<string, InfographicOptions> = new Map();

    /**
     * Create a processing job for selected videos
     * @param playlistId - The playlist ID
     * @param videoIds - Array of video IDs to process
     * @param apiKeys - API keys to use for this job (from user or system based on plan)
     * @param options - Customization options for the infographic
     */
    async createJob(playlistId: string, videoIds: string[], apiKeys: ApiKeys, options?: InfographicOptions) {
        const job = await prisma.processingJob.create({
            data: {
                playlistId,
                videoIds,
                status: 'PENDING',
                progress: 0,
                options: options || null,
            },
        });

        // Store API keys and options for this job in memory
        this.jobApiKeys.set(job.id, apiKeys);
        if (options) {
            this.jobOptions.set(job.id, options);
        }

        // Start processing in background
        this.processJob(job.id).catch(console.error);

        return job;
    }

    /**
     * Process all videos in a job
     */
    async processJob(jobId: string) {
        const job = await prisma.processingJob.findUnique({
            where: { id: jobId },
        });

        if (!job) {
            throw new Error('Job not found');
        }

        // Get API keys for this job
        const apiKeys = this.jobApiKeys.get(jobId);
        if (!apiKeys) {
            throw new Error('API keys not found for job');
        }

        // Update job status to processing
        await prisma.processingJob.update({
            where: { id: jobId },
            data: { status: 'PROCESSING' },
        });

        const totalVideos = job.videoIds.length;
        let processedCount = 0;

        for (const videoId of job.videoIds) {
            try {
                // Update current video being processed
                await prisma.processingJob.update({
                    where: { id: jobId },
                    data: { currentVideoId: videoId, currentStep: 'starting' },
                });

                const options = this.jobOptions.get(jobId);
                await this.generateInfographic(videoId, jobId, apiKeys, options);
                processedCount++;

                // Update progress
                const progress = Math.round((processedCount / totalVideos) * 100);
                await prisma.processingJob.update({
                    where: { id: jobId },
                    data: { progress },
                });
            } catch (error) {
                console.error(`Error processing video ${videoId}:`, error);

                // Mark infographic as failed
                await prisma.infographic.upsert({
                    where: { videoId },
                    update: { status: 'FAILED' },
                    create: {
                        videoId,
                        imageUrl: '',
                        status: 'FAILED',
                    },
                });
            }
        }

        // Clean up API keys and options from memory
        this.jobApiKeys.delete(jobId);
        this.jobOptions.delete(jobId);

        // Update job status to completed
        await prisma.processingJob.update({
            where: { id: jobId },
            data: {
                status: 'COMPLETED',
                progress: 100,
                currentStep: 'completed',
                currentVideoId: null,
            },
        });
    }

    /**
     * Generate infographic for a single video
     */
    async generateInfographic(videoId: string, jobId?: string, apiKeys?: ApiKeys, options?: InfographicOptions) {
        // Helper to update current step
        const updateStep = async (step: string) => {
            if (jobId) {
                await prisma.processingJob.update({
                    where: { id: jobId },
                    data: { currentStep: step },
                });
            }
            console.log(`[${videoId}] ${step}`);
        };

        // Check if infographic already exists
        const existing = await prisma.infographic.findUnique({
            where: { videoId },
        });

        if (existing && existing.status === 'COMPLETED') {
            return existing;
        }

        // Create or update infographic to processing state
        await prisma.infographic.upsert({
            where: { videoId },
            update: { status: 'PROCESSING' },
            create: {
                videoId,
                imageUrl: '',
                status: 'PROCESSING',
            },
        });

        // Ensure we have API keys
        if (!apiKeys) {
            throw new Error('API keys are required for infographic generation');
        }

        try {
            // Step 1: Get transcript
            await updateStep('Getting transcript...');
            const transcript = await transcriptService.processVideoTranscript(videoId);

            // Step 2: Analyze content
            await updateStep('Analyzing content...');
            const analysisReport = await aiAnalysisService.analyzeContent(transcript, apiKeys.geminiApiKey, options);

            // Step 3: Generate design prompt
            await updateStep('Generating design prompt...');
            const designPrompt = await aiAnalysisService.generateDesignPrompt(analysisReport, apiKeys.geminiApiKey, options);

            // Step 4: Generate image
            await updateStep('Generating image...');
            const imageUrl = await imageGenerationService.generateImage(designPrompt, apiKeys.atlasCloudApiKey);

            // Step 5: Save infographic
            await updateStep('Saving...');
            const infographic = await prisma.infographic.update({
                where: { videoId },
                data: {
                    imageUrl,
                    analysisReport,
                    designPrompt,
                    status: 'COMPLETED',
                },
            });

            await updateStep('Completed!');
            return infographic;
        } catch (error) {
            await prisma.infographic.update({
                where: { videoId },
                data: { status: 'FAILED' },
            });
            if (jobId) {
                await prisma.processingJob.update({
                    where: { id: jobId },
                    data: { currentStep: 'Failed' },
                });
            }
            throw error;
        }
    }

    /**
     * Get job status
     */
    async getJobStatus(jobId: string) {
        return prisma.processingJob.findUnique({
            where: { id: jobId },
        });
    }

    /**
     * Get infographic by video ID
     */
    async getInfographicByVideoId(videoId: string) {
        return prisma.infographic.findUnique({
            where: { videoId },
            include: {
                video: true,
            },
        });
    }

    /**
     * Get all infographics for a playlist
     */
    async getPlaylistInfographics(playlistId: string) {
        return prisma.infographic.findMany({
            where: {
                video: {
                    playlistId,
                },
            },
            include: {
                video: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Get all jobs for a user (by playlist ownership)
     */
    async getUserJobs(userId: string) {
        // First get playlists owned by this user with all needed fields
        const userPlaylists = await prisma.playlist.findMany({
            where: { userId },
            select: {
                id: true,
                title: true,
                url: true,
                videoCount: true,
            },
        });

        if (userPlaylists.length === 0) {
            return [];
        }

        const playlistIds = userPlaylists.map(p => p.id);
        const playlistMap = new Map(userPlaylists.map(p => [p.id, p]));

        const jobs = await prisma.processingJob.findMany({
            where: {
                playlistId: { in: playlistIds },
            },
            orderBy: { createdAt: 'desc' },
        });

        // Combine jobs with playlist info
        return jobs.map(job => ({
            ...job,
            playlist: playlistMap.get(job.playlistId) || null,
        }));
    }
}

export const infographicService = new InfographicService();

