import axios from 'axios';
import { env } from '../config/env.js';
import prisma from '../config/prisma.js';

interface TranscriptSegment {
    text: string;
    start?: number;
    duration?: number;
}

export class TranscriptService {
    private readonly apifyToken: string;
    private readonly scraperUrl = 'https://api.apify.com/v2/acts/pintostudio~youtube-transcript-scraper/run-sync-get-dataset-items';

    constructor() {
        this.apifyToken = env.APIFY_API_TOKEN;
    }

    /**
     * Get transcript for a YouTube video
     */
    async getTranscript(videoUrl: string): Promise<string> {
        try {
            const response = await axios.post<{ data: TranscriptSegment[] }[]>(
                `${this.scraperUrl}?token=${this.apifyToken}`,
                { videoUrl },
                { timeout: 120000 }
            );

            if (!response.data || response.data.length === 0) {
                throw new Error('No transcript data received');
            }

            // Combine all transcript segments into one text
            const transcriptData = response.data[0]?.data || [];
            const fullTranscript = transcriptData
                .map(segment => segment.text.trim())
                .join(' ');

            return fullTranscript;
        } catch (error) {
            console.error('Error getting transcript:', error);
            throw error;
        }
    }

    /**
     * Get and save transcript for a video
     */
    async processVideoTranscript(videoId: string): Promise<string> {
        const video = await prisma.video.findUnique({
            where: { id: videoId },
        });

        if (!video) {
            throw new Error('Video not found');
        }

        // If transcript already exists, return it
        if (video.transcript) {
            return video.transcript;
        }

        // Get transcript from API
        const transcript = await this.getTranscript(video.url);

        // Save transcript to database
        await prisma.video.update({
            where: { id: videoId },
            data: { transcript },
        });

        return transcript;
    }
}

export const transcriptService = new TranscriptService();
