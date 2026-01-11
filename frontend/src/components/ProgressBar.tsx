'use client';

import { motion } from 'framer-motion';

interface ProgressBarProps {
    progress: number;
    label?: string;
}

export default function ProgressBar({ progress, label }: ProgressBarProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
        >
            {label && (
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">{label}</span>
                    <span className="text-sm font-medium text-purple-400">{progress}%</span>
                </div>
            )}

            <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                />
            </div>
        </motion.div>
    );
}
