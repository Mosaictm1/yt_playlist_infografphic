'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
    extractPlaylist,
    generateInfographics,
    getJobStatus,
    getPlaylistInfographics,
    Playlist,
    ProcessingJob,
    Infographic
} from '@/services/api';
import {
    PlaylistForm,
    VideoGrid,
    InfographicGallery,
    LoadingState,
    ProgressBar
} from '@/components';
import { Sparkles, ArrowLeft } from 'lucide-react';

export default function Home() {
    const [playlist, setPlaylist] = useState<Playlist | null>(null);
    const [selectedVideoIds, setSelectedVideoIds] = useState<string[]>([]);
    const [currentJob, setCurrentJob] = useState<ProcessingJob | null>(null);
    const [infographics, setInfographics] = useState<Infographic[]>([]);

    // Extract playlist mutation
    const extractMutation = useMutation({
        mutationFn: extractPlaylist,
        onSuccess: (data) => {
            setPlaylist(data);
            setSelectedVideoIds([]);
        },
    });

    // Generate infographics mutation
    const generateMutation = useMutation({
        mutationFn: ({ playlistId, videoIds }: { playlistId: string; videoIds: string[] }) =>
            generateInfographics(playlistId, videoIds),
        onSuccess: (job) => {
            setCurrentJob(job);
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
    };

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
                </div>
            </header>

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
                                    <ProgressBar
                                        progress={currentJob.progress}
                                        label={`معالجة ${Math.ceil((currentJob.progress / 100) * selectedVideoIds.length)} من ${selectedVideoIds.length}`}
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
