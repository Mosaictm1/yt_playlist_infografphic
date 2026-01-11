'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
    extractPlaylist,
    generateInfographics,
    getJobStatus,
    getPlaylistInfographics,
    getPlaylist,
    Playlist,
    ProcessingJob,
    Infographic
} from '@/services/api';
import {
    PlaylistForm,
    VideoGrid,
    InfographicGallery,
    LoadingState,
    ProgressBar,
    ProcessingSteps
} from '@/components';
import { Sparkles, ArrowLeft, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
    const { user, loading, signOut } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [playlist, setPlaylist] = useState<Playlist | null>(null);
    const [selectedVideoIds, setSelectedVideoIds] = useState<string[]>([]);
    const [currentJob, setCurrentJob] = useState<ProcessingJob | null>(null);
    const [infographics, setInfographics] = useState<Infographic[]>([]);
    const [isRestoring, setIsRestoring] = useState(true);

    // Update URL when playlist changes
    const updateUrl = useCallback((playlistId?: string, jobId?: string) => {
        const params = new URLSearchParams();
        if (playlistId) params.set('playlist', playlistId);
        if (jobId) params.set('job', jobId);
        const newUrl = params.toString() ? `?${params.toString()}` : '/';
        window.history.replaceState({}, '', newUrl);
    }, []);

    // Restore state from URL on mount
    useEffect(() => {
        const restoreState = async () => {
            const playlistId = searchParams.get('playlist');
            const jobId = searchParams.get('job');

            if (playlistId) {
                try {
                    const restoredPlaylist = await getPlaylist(playlistId);
                    setPlaylist(restoredPlaylist);

                    // Also fetch infographics
                    const infos = await getPlaylistInfographics(playlistId);
                    setInfographics(infos);

                    if (jobId) {
                        const job = await getJobStatus(jobId);
                        if (job.status === 'PROCESSING' || job.status === 'PENDING') {
                            setCurrentJob(job);
                        }
                    }
                } catch (error) {
                    console.error('Failed to restore state:', error);
                }
            }
            setIsRestoring(false);
        };

        restoreState();
    }, [searchParams]);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [loading, user, router]);

    // Extract playlist mutation
    const extractMutation = useMutation({
        mutationFn: extractPlaylist,
        onSuccess: (data) => {
            setPlaylist(data);
            setSelectedVideoIds([]);
            updateUrl(data.id);
        },
    });

    // Generate infographics mutation
    const generateMutation = useMutation({
        mutationFn: ({ playlistId, videoIds }: { playlistId: string; videoIds: string[] }) =>
            generateInfographics(playlistId, videoIds),
        onSuccess: (job) => {
            setCurrentJob(job);
            if (playlist) {
                updateUrl(playlist.id, job.id);
            }
        },
    });

    // Poll job status when processing
    const { data: jobStatus } = useQuery({
        queryKey: ['job', currentJob?.id],
        queryFn: () => getJobStatus(currentJob!.id),
        enabled: !!currentJob?.id && currentJob.status !== 'COMPLETED' && currentJob.status !== 'FAILED',
        refetchInterval: 3000,
    });

    // Update job status and fetch infographics when completed
    useEffect(() => {
        if (jobStatus) {
            setCurrentJob(jobStatus);

            if (jobStatus.status === 'COMPLETED' && playlist) {
                // Fetch completed infographics
                getPlaylistInfographics(playlist.id).then(setInfographics);
            }
        }
    }, [jobStatus, playlist]);

    // Fetch existing infographics when playlist loads
    useEffect(() => {
        if (playlist) {
            getPlaylistInfographics(playlist.id).then(setInfographics);
        }
    }, [playlist]);

    const handleExtract = (url: string) => {
        extractMutation.mutate(url);
    };

    const handleGenerate = () => {
        if (playlist && selectedVideoIds.length > 0) {
            generateMutation.mutate({
                playlistId: playlist.id,
                videoIds: selectedVideoIds,
            });
        }
    };

    const handleReset = () => {
        setPlaylist(null);
        setSelectedVideoIds([]);
        setCurrentJob(null);
        setInfographics([]);
        updateUrl(); // Clear URL params
    };

    const handleSignOut = async () => {
        await signOut();
        router.push('/login');
    };

    // Loading state
    if (loading || isRestoring) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <div className="text-white text-xl">جاري التحميل...</div>
            </div>
        );
    }

    // Not authenticated
    if (!user) {
        return null;
    }

    // Check if FREE user needs API keys
    const needsApiKeys = user.plan === 'FREE' &&
        (!user.hasApiKeys.apifyApiToken || !user.hasApiKeys.geminiApiKey || !user.hasApiKeys.atlasCloudApiKey);

    return (
        <main className="min-h-screen">
            {/* Header */}
            <header className="sticky top-0 z-40 glass border-b border-white/10">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-xl font-bold gradient-text hidden sm:block">
                            YouTube Infographic Generator
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        {playlist && (
                            <motion.button
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                onClick={handleReset}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg glass glass-hover transition-all text-sm"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span>قائمة جديدة</span>
                            </motion.button>
                        )}

                        <Link
                            href="/settings"
                            className="p-2 rounded-lg glass glass-hover transition-all"
                            title="الإعدادات"
                        >
                            <Settings className="w-5 h-5 text-gray-400" />
                        </Link>

                        <button
                            onClick={handleSignOut}
                            className="p-2 rounded-lg glass glass-hover transition-all"
                            title="تسجيل الخروج"
                        >
                            <LogOut className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>
                </div>
            </header>

            {/* API Keys Warning */}
            {needsApiKeys && (
                <div className="bg-yellow-500/20 border-b border-yellow-500/30">
                    <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                        <p className="text-yellow-300 text-sm">
                            ⚠️ الخطة المجانية تتطلب إدخال API keys الخاصة بك لاستخدام التطبيق
                        </p>
                        <Link
                            href="/settings"
                            className="px-4 py-1 bg-yellow-500/30 rounded-lg text-yellow-200 text-sm hover:bg-yellow-500/40 transition-colors"
                        >
                            إضافة المفاتيح
                        </Link>
                    </div>
                </div>
            )}

            {/* Main content */}
            <div className="container mx-auto px-4 py-8">
                <AnimatePresence mode="wait">
                    {!playlist ? (
                        // Step 1: Enter playlist URL
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="flex flex-col items-center justify-center min-h-[60vh]"
                        >
                            {/* Hero section */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center mb-12"
                            >
                                <h1 className="text-4xl md:text-6xl font-bold mb-4">
                                    <span className="gradient-text">حوّل الفيديوهات</span>
                                    <br />
                                    <span className="text-white">إلى Infographics</span>
                                </h1>
                                <p className="text-gray-400 text-lg max-w-xl mx-auto">
                                    أدخل رابط قائمة تشغيل YouTube واختر الفيديوهات التي تريد تحويلها
                                    إلى صور Infographic جذابة باستخدام الذكاء الاصطناعي
                                </p>
                            </motion.div>

                            <PlaylistForm
                                onSubmit={handleExtract}
                                isLoading={extractMutation.isPending}
                            />

                            {extractMutation.isError && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="mt-4 text-red-400 text-sm"
                                >
                                    حدث خطأ أثناء استخراج الفيديوهات. يرجى المحاولة مرة أخرى.
                                </motion.p>
                            )}
                        </motion.div>
                    ) : (
                        // Step 2: Select videos and generate
                        <motion.div
                            key="videos"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            {/* Playlist info */}
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-white mb-2">
                                    {playlist.title}
                                </h2>
                                <p className="text-gray-400">
                                    {playlist.videoCount} فيديو
                                </p>
                            </div>

                            {/* Processing progress */}
                            {currentJob && currentJob.status === 'PROCESSING' && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-8 p-6 glass rounded-xl"
                                >
                                    <h3 className="text-lg font-semibold text-white mb-4">
                                        جاري إنشاء Infographics...
                                    </h3>
                                    <ProcessingSteps
                                        progress={currentJob.progress}
                                        videoTitle={playlist.videos.find(v => selectedVideoIds.includes(v.id))?.title}
                                    />
                                </motion.div>
                            )}

                            {/* Video grid */}
                            <VideoGrid
                                videos={playlist.videos}
                                selectedIds={selectedVideoIds}
                                onSelectionChange={setSelectedVideoIds}
                                onGenerate={handleGenerate}
                                isGenerating={generateMutation.isPending || currentJob?.status === 'PROCESSING'}
                            />

                            {/* Infographic gallery */}
                            <InfographicGallery infographics={infographics} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer */}
            <footer className="mt-auto py-6 border-t border-white/10">
                <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
                    <p>Made with ❤️ using Gemini AI & Atlas Cloud</p>
                </div>
            </footer>
        </main>
    );
}
