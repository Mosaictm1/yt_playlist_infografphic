'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Infographic } from '@/services/api';
import { Download, X, ZoomIn, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface InfographicGalleryProps {
    infographics: Infographic[];
}

export default function InfographicGallery({ infographics }: InfographicGalleryProps) {
    const [selectedImage, setSelectedImage] = useState<Infographic | null>(null);

    const handleDownload = (infographic: Infographic) => {
        // Open in new tab and let user right-click save (avoids CORS)
        const filename = `infographic-${infographic.video?.title || infographic.id}.png`;
        const a = document.createElement('a');
        a.href = infographic.imageUrl;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        // Try download attribute, but it may not work cross-origin
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const completedInfographics = infographics.filter((ig) => ig.status === 'COMPLETED');
    const processingInfographics = infographics.filter((ig) => ig.status === 'PROCESSING');

    if (infographics.length === 0) {
        return null;
    }

    return (
        <div className="w-full mt-12">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-purple-500/20">
                    <ImageIcon className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold gradient-text">Infographics</h2>
                    <p className="text-gray-400 text-sm">
                        {completedInfographics.length} جاهز
                        {processingInfographics.length > 0 && ` • ${processingInfographics.length} قيد المعالجة`}
                    </p>
                </div>
            </div>

            {/* Processing indicator */}
            {processingInfographics.length > 0 && (
                <div className="mb-6 p-4 glass rounded-xl flex items-center gap-3">
                    <div className="w-6 h-6 spinner" />
                    <span className="text-sm text-gray-300">
                        جاري معالجة {processingInfographics.length} infographic...
                    </span>
                </div>
            )}

            {/* Gallery grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {completedInfographics.map((infographic, index) => (
                    <motion.div
                        key={infographic.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass rounded-xl overflow-hidden group"
                    >
                        {/* Image */}
                        <div className="relative aspect-[3/4]">
                            <Image
                                src={infographic.imageUrl}
                                alt={infographic.video?.title || 'Infographic'}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />

                            {/* Overlay with actions */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 
                              transition-opacity flex items-center justify-center gap-4">
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setSelectedImage(infographic)}
                                    className="p-3 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
                                >
                                    <ZoomIn className="w-6 h-6 text-white" />
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleDownload(infographic)}
                                    className="p-3 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
                                >
                                    <Download className="w-6 h-6 text-white" />
                                </motion.button>
                            </div>
                        </div>

                        {/* Title */}
                        <div className="p-3">
                            <h3 className="text-sm font-medium text-white line-clamp-2 text-right" dir="auto">
                                {infographic.video?.title}
                            </h3>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
                        onClick={() => setSelectedImage(null)}
                    >
                        <motion.button
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                            onClick={() => setSelectedImage(null)}
                        >
                            <X className="w-6 h-6 text-white" />
                        </motion.button>

                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="relative max-w-4xl max-h-[90vh] w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Image
                                src={selectedImage.imageUrl}
                                alt={selectedImage.video?.title || 'Infographic'}
                                fill
                                className="object-contain"
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
