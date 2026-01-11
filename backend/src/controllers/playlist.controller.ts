import { Request, Response } from 'express';
import { playlistService } from '../services/index.js';
import { z } from 'zod';

const extractPlaylistSchema = z.object({
    url: z.string().url().refine(
        (url) => url.includes('youtube.com/playlist') || url.includes('list='),
        { message: 'Invalid YouTube playlist URL' }
    ),
});

export class PlaylistController {
    /**
     * POST /api/playlist/extract
     * Extract videos from a YouTube playlist
     */
    async extractPlaylist(req: Request, res: Response) {
        try {
            const { url } = extractPlaylistSchema.parse(req.body);

            const result = await playlistService.extractPlaylist(url);

            res.status(200).json({
                success: true,
                data: result,
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid request',
                    details: error.errors,
                });
            }

            console.error('Error extracting playlist:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to extract playlist',
            });
        }
    }

    /**
     * GET /api/playlist/:id
     * Get playlist details with videos
     */
    async getPlaylist(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const playlist = await playlistService.getPlaylistById(id);

            if (!playlist) {
                return res.status(404).json({
                    success: false,
                    error: 'Playlist not found',
                });
            }

            res.status(200).json({
                success: true,
                data: playlist,
            });
        } catch (error) {
            console.error('Error getting playlist:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get playlist',
            });
        }
    }

    /**
     * GET /api/playlists
     * Get all playlists
     */
    async getAllPlaylists(req: Request, res: Response) {
        try {
            const playlists = await playlistService.getAllPlaylists();

            res.status(200).json({
                success: true,
                data: playlists,
            });
        } catch (error) {
            console.error('Error getting playlists:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get playlists',
            });
        }
    }
}

export const playlistController = new PlaylistController();
