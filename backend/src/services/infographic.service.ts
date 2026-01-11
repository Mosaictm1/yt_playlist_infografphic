import prisma from '../config/prisma.js';
import { transcriptService } from './transcript.service.js';
import { aiAnalysisService } from './ai-analysis.service.js';
import { imageGenerationService } from './image-generation.service.js';
import { Status } from '@prisma/client';

export class InfographicService {
    /**
     * Create a processing job for selected videos
     */
    async createJob(playlistId: string, videoIds: string[]) {
        const job = await prisma.processingJob.create({
            data: {
                playlistId,
                videoIds,
                status: 'PENDING',
                progress: 0,
            },
        });

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

                await this.generateInfographic(videoId, jobId);
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
    async generateInfographic(videoId: string, jobId?: string) {
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

        try {
            // Step 1: Get transcript
            await updateStep('Getting transcript...');
            const transcript = await transcriptService.processVideoTranscript(videoId);

            // Step 2: Analyze content
            await updateStep('Analyzing content...');
            const analysisReport = await aiAnalysisService.analyzeContent(transcript);

            // Step 3: Generate design prompt
            await updateStep('Generating design prompt...');
            const designPrompt = await aiAnalysisService.generateDesignPrompt(analysisReport);

            // Step 4: Generate image
            await updateStep('Generating image...');
            const imageUrl = await imageGenerationService.generateImage(designPrompt);

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
}

export const infographicService = new InfographicService();
