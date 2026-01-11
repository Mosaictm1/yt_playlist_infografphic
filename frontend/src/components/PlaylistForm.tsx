'use client';

import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Search, Loader2, Youtube } from 'lucide-react';

interface PlaylistFormProps {
    onSubmit: (url: string) => void;
    isLoading: boolean;
}

export default function PlaylistForm({ onSubmit, isLoading }: PlaylistFormProps) {
    const [url, setUrl] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (!url.trim()) {
            setError('الرجاء إدخال رابط Playlist');
            return;
        }

        if (!url.includes('youtube.com/playlist') && !url.includes('list=')) {
            setError('رابط Playlist غير صالح');
            return;
        }

        onSubmit(url);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl mx-auto"
        >
            <div className="glass rounded-2xl p-8 glow">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-xl bg-red-500/20">
                        <Youtube className="w-8 h-8 text-red-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold gradient-text">استخراج الفيديوهات</h2>
                        <p className="text-gray-400 text-sm">أدخل رابط قائمة التشغيل من YouTube</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://www.youtube.com/playlist?list=..."
                            className="w-full px-4 py-4 pr-12 rounded-xl bg-white/5 border border-white/10 
                         text-white placeholder-gray-500 focus:border-purple-500 
                         focus:ring-2 focus:ring-purple-500/20 transition-all duration-300
                         text-left dir-ltr"
                            disabled={isLoading}
                            dir="ltr"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    </div>

                    {error && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-red-400 text-sm text-right"
                        >
                            {error}
                        </motion.p>
                    )}

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 
                       text-white font-semibold hover:from-purple-500 hover:to-pink-500
                       disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300
                       flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>جاري الاستخراج...</span>
                            </>
                        ) : (
                            <>
                                <Search className="w-5 h-5" />
                                <span>استخراج الفيديوهات</span>
                            </>
                        )}
                    </motion.button>
                </form>
            </div>
        </motion.div>
    );
}
