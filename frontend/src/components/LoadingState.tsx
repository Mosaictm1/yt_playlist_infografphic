'use client';

import { motion } from 'framer-motion';

interface LoadingStateProps {
    message?: string;
}

export default function LoadingState({ message = 'جاري التحميل...' }: LoadingStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20"
        >
            <div className="relative w-16 h-16">
                {/* Outer ring */}
                <div className="absolute inset-0 rounded-full border-4 border-purple-500/20" />
                {/* Spinning ring */}
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" />
                {/* Inner glow */}
                <div className="absolute inset-2 rounded-full bg-purple-500/10 animate-pulse" />
            </div>

            <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-4 text-gray-400"
            >
                {message}
            </motion.p>
        </motion.div>
    );
}
