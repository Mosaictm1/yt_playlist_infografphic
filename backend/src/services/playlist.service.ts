import axios from 'axios';
import { env } from '../config/env.js';
import prisma from '../config/prisma.js';

interface ApifyVideoItem {
    video_link: string;
    video_title?: string;
    thumbnail?: string;
    duration?: string;
    playlist_info?: {
        playlist_id: string;
        playlist_title?: string;
        playlist_videos?: number;
    };
}

export class PlaylistService {
    private readonly apifyToken: string;
    private readonly scraperUrl = 'https://api.apify.com/v2/acts/grandmaster~youtube-playlist-scraper---lightning-fast-low-cost/run-sync-get-dataset-items';

    constructor() {
        this.apifyToken = env.APIFY_API_TOKEN;
    }

    /**
     * Extract videos from a YouTube playlist URL
     */
    async extractPlaylist(playlistUrl: string) {
        try {
            // Call Apify to scrape the playlist
            const response = await axios.post<ApifyVideoItem[]>(
                `${this.scraperUrl}?token=${this.apifyToken}`,
                {
                    start_urls: [playlistUrl]
                },
                {
                    timeout: 120000 // 2 minutes timeout
                }
            );

            const videos = response.data;

            if (!videos || videos.length === 0) {
                throw new Error('No videos found in playlist');
            }

            // Extract playlist info from first video
            const playlistInfo = videos[0].playlist_info;

            // Create or update playlist in database
            const playlist = await prisma.playlist.upsert({
                where: { url: playlistUrl },
                update: {
                    title: playlistInfo?.playlist_title || 'Untitled Playlist',
                    videoCount: videos.length,
                },
                create: {
                    url: playlistUrl,
                    title: playlistInfo?.playlist_title || 'Untitled Playlist',
                    videoCount: videos.length,
                },
            });

            // Create videos in database
            const videoRecords = await Promise.all(
                videos.map(async (video) => {
                    const videoId = this.extractVideoId(video.video_link);

                    return prisma.video.upsert({
                        where: { videoId },
                        update: {
                            title: video.video_title || 'Untitled Video',
                            thumbnail: video.thumbnail,
                            duration: video.duration,
                            url: video.video_link,
                            playlistId: playlist.id,
                        },
                        create: {
                            videoId,
                            title: video.video_title || 'Untitled Video',
                            thumbnail: video.thumbnail,
                            duration: video.duration,
                            url: video.video_link,
                            playlistId: playlist.id,
                        },
                    });
                })
            );

            return {
                ...playlist,
                videos: videoRecords,
            };
        } catch (error) {
            console.error('Error extracting playlist:', error);
            throw error;
        }
    }

    /**
     * Get playlist by ID with videos
     */
    async getPlaylistById(id: string) {
        return prisma.playlist.findUnique({
            where: { id },
            include: {
                videos: {
                    include: {
                        infographic: true,
                    },
                },
            },
        });
    }

    /**
     * Get all playlists
     */
    async getAllPlaylists() {
        return prisma.playlist.findMany({
            include: {
                _count: {
                    select: { videos: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Extract YouTube video ID from URL
     */
    private extractVideoId(url: string): string {
        const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
        const match = url.match(regex);
        return match ? match[1] : url;
    }
}

export const playlistService = new PlaylistService();
