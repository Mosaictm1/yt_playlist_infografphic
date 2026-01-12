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
    private readonly scraperUrl = 'https://api.apify.com/v2/acts/pintostudio~youtube-transcript-scraper/run-sync-get-dataset-items';

    constructor() {
        this.apifyToken = env.APIFY_API_TOKEN;
    }

    /**
     * Clean video URL by removing playlist parameters
     */
    private cleanVideoUrl(url: string): string {
        try {
            const urlObj = new URL(url);
            // Keep only the video ID parameter
            const videoId = urlObj.searchParams.get('v');
            if (videoId) {
                return `https://www.youtube.com/watch?v=${videoId}`;
            }
            return url;
        } catch {
            return url;
        }
    }

    /**
     * Get transcript for a YouTube video
     */
    async getTranscript(videoUrl: string): Promise<string> {
        try {
            // Clean the URL - remove playlist parameters that cause issues
            const cleanUrl = this.cleanVideoUrl(videoUrl);
            console.log(`[Transcript] Fetching transcript for: ${cleanUrl}`);

            const response = await axios.post<{ data: TranscriptSegment[] }[]>(
                `${this.scraperUrl}?token=${this.apifyToken}`,
                { videoUrl: cleanUrl },
                { timeout: 120000 }
            );

            console.log(`[Transcript] Response received, items: ${response.data?.length}`);

            if (!response.data || response.data.length === 0) {
                throw new Error('No transcript data received');
            }

            // Combine all transcript segments into one text
            const transcriptData = response.data[0]?.data || [];
            const fullTranscript = transcriptData
                .map(segment => segment.text.trim())
                .join(' ');

            if (!fullTranscript) {
                throw new Error('Could not extract transcript from response');
            }

            console.log(`[Transcript] Extracted ${fullTranscript.length} characters`);
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
