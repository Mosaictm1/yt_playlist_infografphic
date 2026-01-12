'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BarChart3, Check } from 'lucide-react';

export interface InfographicOptions {
    language: 'ar' | 'en';
    orientation: 'landscape' | 'portrait' | 'square';
    detailLevel: 'concise' | 'standard' | 'detailed';
    customDescription: string;
}

interface CustomizeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (options: InfographicOptions) => void;
    isGenerating?: boolean;
}

const defaultOptions: InfographicOptions = {
    language: 'en',
    orientation: 'landscape',
    detailLevel: 'standard',
    customDescription: '',
};

export default function CustomizeModal({
    isOpen,
    onClose,
    onGenerate,
    isGenerating = false,
}: CustomizeModalProps) {
    const [options, setOptions] = useState<InfographicOptions>(defaultOptions);

    const handleGenerate = () => {
        onGenerate(options);
    };

    const orientationOptions = [
        { value: 'landscape', label: 'Landscape' },
        { value: 'portrait', label: 'Portrait' },
        { value: 'square', label: 'Square' },
    ] as const;

    const detailOptions: Array<{ value: 'concise' | 'standard' | 'detailed'; label: string; badge?: string }> = [
        { value: 'concise', label: 'Concise' },
        { value: 'standard', label: 'Standard' },
        { value: 'detailed', label: 'Detailed', badge: 'BETA' },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg"
                    >
                        <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center justify-between p-5 border-b border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-purple-500/20">
                                        <BarChart3 className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <h2 className="text-lg font-semibold text-white">
                                        Customize Infographic
                                    </h2>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-5 space-y-6">
                                {/* Language & Orientation Row */}
                                <div className="grid grid-cols-2 gap-6">
                                    {/* Language */}
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">
                                            Choose language
                                        </label>
                                        <select
                                            value={options.language}
                                            onChange={(e) =>
                                                setOptions({ ...options, language: e.target.value as 'ar' | 'en' })
                                            }
                                            className="w-full px-4 py-2.5 bg-[#252540] border border-white/10 rounded-lg 
                                                     text-white focus:outline-none focus:border-purple-500 
                                                     transition-colors cursor-pointer appearance-none"
                                            style={{
                                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                                                backgroundRepeat: 'no-repeat',
                                                backgroundPosition: 'right 0.75rem center',
                                                backgroundSize: '1.25rem',
                                            }}
                                        >
                                            <option value="en">English</option>
                                            <option value="ar">العربية</option>
                                        </select>
                                    </div>

                                    {/* Orientation */}
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">
                                            Choose orientation
                                        </label>
                                        <div className="flex rounded-lg border border-white/10 overflow-hidden">
                                            {orientationOptions.map((opt) => (
                                                <button
                                                    key={opt.value}
                                                    onClick={() => setOptions({ ...options, orientation: opt.value })}
                                                    className={`flex-1 py-2.5 px-3 text-sm font-medium transition-all
                                                              flex items-center justify-center gap-1.5
                                                              ${options.orientation === opt.value
                                                            ? 'bg-[#3a3a5c] text-white'
                                                            : 'bg-[#252540] text-gray-400 hover:text-white hover:bg-[#2a2a48]'
                                                        }`}
                                                >
                                                    {options.orientation === opt.value && (
                                                        <Check className="w-4 h-4" />
                                                    )}
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Detail Level */}
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">
                                        Level of detail
                                    </label>
                                    <div className="flex rounded-lg border border-white/10 overflow-hidden">
                                        {detailOptions.map((opt) => (
                                            <button
                                                key={opt.value}
                                                onClick={() => setOptions({ ...options, detailLevel: opt.value })}
                                                className={`flex-1 py-2.5 px-4 text-sm font-medium transition-all
                                                          flex items-center justify-center gap-2
                                                          ${options.detailLevel === opt.value
                                                        ? 'bg-[#3a3a5c] text-white'
                                                        : 'bg-[#252540] text-gray-400 hover:text-white hover:bg-[#2a2a48]'
                                                    }`}
                                            >
                                                {options.detailLevel === opt.value && (
                                                    <Check className="w-4 h-4" />
                                                )}
                                                {opt.label}
                                                {opt.badge && (
                                                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-gray-600 rounded text-gray-300">
                                                        {opt.badge}
                                                    </span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Custom Description */}
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">
                                        Describe the infographic you want to create
                                    </label>
                                    <textarea
                                        value={options.customDescription}
                                        onChange={(e) =>
                                            setOptions({ ...options, customDescription: e.target.value })
                                        }
                                        placeholder='Guide the style, color, or focus: "Use a blue color theme and highlight the 3 key stats."'
                                        rows={3}
                                        className="w-full px-4 py-3 bg-[#252540] border border-white/10 rounded-lg 
                                                 text-white placeholder-gray-500 resize-none
                                                 focus:outline-none focus:border-purple-500 transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-5 pt-0 flex justify-end">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleGenerate}
                                    disabled={isGenerating}
                                    className="px-8 py-2.5 bg-purple-600 hover:bg-purple-500 
                                             text-white font-semibold rounded-xl
                                             disabled:opacity-50 disabled:cursor-not-allowed
                                             transition-colors"
                                >
                                    {isGenerating ? 'Generating...' : 'Generate'}
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
