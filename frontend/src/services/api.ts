import axios from 'axios';
import { supabase as getSupabase } from '@/contexts/AuthContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to all requests
api.interceptors.request.use(async (config) => {
    const supabase = getSupabase();
    if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
            config.headers.Authorization = `Bearer ${session.access_token}`;
        }
    }
    return config;
});


// Types
export interface Video {
    id: string;
    videoId: string;
    title: string;
    thumbnail: string | null;
    duration: string | null;
    url: string;
    transcript: string | null;
    infographic?: Infographic | null;
}

export interface Playlist {
    id: string;
    url: string;
    title: string | null;
    videoCount: number;
    videos: Video[];
    createdAt: string;
}

export interface Infographic {
    id: string;
    imageUrl: string;
    analysisReport: string | null;
    designPrompt: string | null;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    videoId: string;
    video?: Video;
}

export interface ProcessingJob {
    id: string;
    playlistId: string;
    videoIds: string[];
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    progress: number;
    currentStep: string | null;
    currentVideoId: string | null;
    error: string | null;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

// API Functions
export const extractPlaylist = async (url: string): Promise<Playlist> => {
    const response = await api.post<ApiResponse<Playlist>>('/playlist/extract', { url });
    if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to extract playlist');
    }
    return response.data.data;
};

export const getPlaylist = async (id: string): Promise<Playlist> => {
    const response = await api.get<ApiResponse<Playlist>>(`/playlist/${id}`);
    if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to get playlist');
    }
    return response.data.data;
};

export const generateInfographics = async (
    playlistId: string,
    videoIds: string[]
): Promise<ProcessingJob> => {
    const response = await api.post<ApiResponse<ProcessingJob>>('/infographic/generate', {
        playlistId,
        videoIds,
    });
    if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to start generation');
    }
    return response.data.data;
};

export const getJobStatus = async (jobId: string): Promise<ProcessingJob> => {
    const response = await api.get<ApiResponse<ProcessingJob>>(`/infographic/job/${jobId}`);
    if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to get job status');
    }
    return response.data.data;
};

export const getPlaylistInfographics = async (playlistId: string): Promise<Infographic[]> => {
    const response = await api.get<ApiResponse<Infographic[]>>(`/playlist/${playlistId}/infographics`);
    if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to get infographics');
    }
    return response.data.data;
};
