import axios from 'axios';
import { env } from '../config/env.js';
import prisma from '../config/prisma.js';

interface TranscriptSegment {
    text: string;
    start?: number;
    duration?: number;
}

interface TranscriptResponse {
    videoId?: string;
    transcript?: TranscriptSegment[] | string;
    data?: TranscriptSegment[];
    text?: string;
}

export class TranscriptService {
    private readonly apifyToken: string;
    // Using a more reliable transcript scraper
    private readonly scraperUrl = 'https://api.apify.com/v2/acts/bernhardksf~youtube-transcript-scraper/run-sync-get-dataset-items';

    constructor() {
        this.apifyToken = env.APIFY_API_TOKEN;
    }

    /**
     * Get transcript for a YouTube video
     */
    async getTranscript(videoUrl: string): Promise<string> {
        try {
            console.log(`[Transcript] Fetching transcript for: ${videoUrl}`);

            const response = await axios.post<TranscriptResponse[]>(
                `${this.scraperUrl}?token=${this.apifyToken}`,
                {
                    startUrls: [{ url: videoUrl }],
                    maxResults: 1
                },
                { timeout: 120000 }
            );

            console.log(`[Transcript] Response received:`, JSON.stringify(response.data).substring(0, 500));

            if (!response.data || response.data.length === 0) {
                throw new Error('No transcript data received');
            }

            // Handle different response formats
            const item = response.data[0];
            let fullTranscript = '';

            if (typeof item.transcript === 'string') {
                fullTranscript = item.transcript;
            } else if (Array.isArray(item.transcript)) {
                fullTranscript = item.transcript.map(s => s.text?.trim() || '').join(' ');
            } else if (Array.isArray(item.data)) {
                fullTranscript = item.data.map(s => s.text?.trim() || '').join(' ');
            } else if (item.text) {
                fullTranscript = item.text;
            }

            if (!fullTranscript) {
                throw new Error('Could not extract transcript from response');
            }

            console.log(`[Transcript] Successfully extracted ${fullTranscript.length} characters`);
            return fullTranscript;
        } catch (error: any) {
            console.error('Error getting transcript:', error.message);
            if (error.response?.data) {
                console.error('Response data:', JSON.stringify(error.response.data));
            }
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
