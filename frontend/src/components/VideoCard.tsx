'use client';

import { motion } from 'framer-motion';
import { Video } from '@/services/api';
import { Check, Clock, Play } from 'lucide-react';
import Image from 'next/image';

interface VideoCardProps {
    video: Video;
    isSelected: boolean;
    onSelect: (id: string) => void;
}

export default function VideoCard({ video, isSelected, onSelect }: VideoCardProps) {
    const thumbnail = video.thumbnail || `https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => onSelect(video.id)}
            className={`glass rounded-xl overflow-hidden cursor-pointer transition-all duration-300
                  ${isSelected ? 'ring-2 ring-purple-500 glow' : 'hover:ring-1 hover:ring-white/20'}`}
        >
            {/* Thumbnail */}
            <div className="relative aspect-video">
                <Image
                    src={thumbnail}
                    alt={video.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />

                {/* Duration badge */}
                {video.duration && (
                    <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/80 text-xs text-white flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {video.duration}
                    </div>
                )}

                {/* Play overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                    <Play className="w-12 h-12 text-white" />
                </div>

                {/* Selection indicator */}
                <motion.div
                    initial={false}
                    animate={{ scale: isSelected ? 1 : 0, opacity: isSelected ? 1 : 0 }}
                    className="absolute top-2 left-2 w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center"
                >
                    <Check className="w-4 h-4 text-white" />
                </motion.div>
            </div>

            {/* Info */}
            <div className="p-3">
                <h3 className="text-sm font-medium text-white line-clamp-2 text-right" dir="auto">
                    {video.title}
                </h3>

                {/* Infographic status */}
                {video.infographic && (
                    <div className={`mt-2 text-xs px-2 py-1 rounded-full inline-flex items-center gap-1
            ${video.infographic.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                            video.infographic.status === 'PROCESSING' ? 'bg-yellow-500/20 text-yellow-400' :
                                video.infographic.status === 'FAILED' ? 'bg-red-500/20 text-red-400' :
                                    'bg-gray-500/20 text-gray-400'}`}
                    >
                        {video.infographic.status === 'COMPLETED' ? '✅ تم الإنشاء' :
                            video.infographic.status === 'PROCESSING' ? '⏳ جاري المعالجة' :
                                video.infographic.status === 'FAILED' ? '❌ فشل' : '⏸️ في الانتظار'}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
