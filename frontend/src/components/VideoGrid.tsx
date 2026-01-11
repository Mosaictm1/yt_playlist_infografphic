'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Video } from '@/services/api';
import VideoCard from './VideoCard';
import { CheckSquare, Square, Wand2, Loader2 } from 'lucide-react';

interface VideoGridProps {
    videos: Video[];
    selectedIds: string[];
    onSelectionChange: (ids: string[]) => void;
    onGenerate: () => void;
    isGenerating: boolean;
}

export default function VideoGrid({
    videos,
    selectedIds,
    onSelectionChange,
    onGenerate,
    isGenerating,
}: VideoGridProps) {
    const isAllSelected = selectedIds.length === videos.length;

    const handleSelectAll = () => {
        if (isAllSelected) {
            onSelectionChange([]);
        } else {
            onSelectionChange(videos.map((v) => v.id));
        }
    };

    const handleVideoSelect = (id: string) => {
        if (selectedIds.includes(id)) {
            onSelectionChange(selectedIds.filter((sid) => sid !== id));
        } else {
            onSelectionChange([...selectedIds, id]);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
        >
            {/* Header with actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleSelectAll}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg glass glass-hover transition-all"
                    >
                        {isAllSelected ? (
                            <CheckSquare className="w-5 h-5 text-purple-400" />
                        ) : (
                            <Square className="w-5 h-5 text-gray-400" />
                        )}
                        <span className="text-sm">
                            {isAllSelected ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
                        </span>
                    </button>

                    <span className="text-sm text-gray-400">
                        {selectedIds.length} من {videos.length} فيديو محدد
                    </span>
                </div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onGenerate}
                    disabled={selectedIds.length === 0 || isGenerating}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl 
                     bg-gradient-to-r from-purple-600 to-pink-600 
                     text-white font-semibold
                     hover:from-purple-500 hover:to-pink-500
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all duration-300"
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>جاري الإنشاء...</span>
                        </>
                    ) : (
                        <>
                            <Wand2 className="w-5 h-5" />
                            <span>إنشاء Infographics</span>
                        </>
                    )}
                </motion.button>
            </div>

            {/* Video grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {videos.map((video, index) => (
                    <motion.div
                        key={video.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <VideoCard
                            video={video}
                            isSelected={selectedIds.includes(video.id)}
                            onSelect={handleVideoSelect}
                        />
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
