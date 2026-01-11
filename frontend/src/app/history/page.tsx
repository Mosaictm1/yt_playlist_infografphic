'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, XCircle, Loader2, ArrowRight, Play } from 'lucide-react';

interface JobHistory {
    id: string;
    playlistId: string;
    videoIds: string[];
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    progress: number;
    currentStep: string | null;
    createdAt: string;
    updatedAt: string;
    playlist: {
        id: string;
        title: string;
        url: string;
        videoCount: number;
    };
}

export default function HistoryPage() {
    const { user, loading, getAccessToken } = useAuth();
    const router = useRouter();
    const [jobs, setJobs] = useState<JobHistory[]>([]);
    const [loadingJobs, setLoadingJobs] = useState(true);
    const [error, setError] = useState('');

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [loading, user, router]);

    useEffect(() => {
        const fetchJobs = async () => {
            if (!user) return;

            try {
                const token = await getAccessToken();
                const response = await fetch(`${apiUrl}/infographic/jobs`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                const data = await response.json();
                if (data.success) {
                    setJobs(data.data);
                } else {
                    setError(data.error || 'فشل تحميل السجل');
                }
            } catch (err) {
                setError('حدث خطأ أثناء تحميل السجل');
            } finally {
                setLoadingJobs(false);
            }
        };

        if (user) {
            fetchJobs();
        }
    }, [user, getAccessToken, apiUrl]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return <CheckCircle className="w-5 h-5 text-green-400" />;
            case 'PROCESSING':
            case 'PENDING':
                return <Loader2 className="w-5 h-5 text-yellow-400 animate-spin" />;
            case 'FAILED':
                return <XCircle className="w-5 h-5 text-red-400" />;
            default:
                return <Clock className="w-5 h-5 text-gray-400" />;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return 'مكتمل';
            case 'PROCESSING':
                return 'قيد التنفيذ';
            case 'PENDING':
                return 'في الانتظار';
            case 'FAILED':
                return 'فشل';
            default:
                return status;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return 'bg-green-500/20 text-green-300 border-green-500/30';
            case 'PROCESSING':
            case 'PENDING':
                return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
            case 'FAILED':
                return 'bg-red-500/20 text-red-300 border-red-500/30';
            default:
                return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading || loadingJobs) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
                    <p className="text-white text-xl">جاري التحميل...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    const processingJobs = jobs.filter(j => j.status === 'PROCESSING' || j.status === 'PENDING');
    const completedJobs = jobs.filter(j => j.status === 'COMPLETED');
    const failedJobs = jobs.filter(j => j.status === 'FAILED');

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4" dir="rtl">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold text-white">📋 سجل الطلبات</h1>
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowRight className="w-4 h-4" />
                        العودة للرئيسية
                    </Link>
                </div>

                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-6">
                        <p className="text-red-300 text-center">{error}</p>
                    </div>
                )}

                {jobs.length === 0 ? (
                    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-12 border border-white/20 text-center">
                        <Clock className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-white mb-2">لا يوجد سجل بعد</h2>
                        <p className="text-gray-400 mb-6">
                            ابدأ بإنشاء Infographics من صفحة الرئيسية
                        </p>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all"
                        >
                            <Play className="w-4 h-4" />
                            ابدأ الآن
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Processing Jobs */}
                        {processingJobs.length > 0 && (
                            <section>
                                <h2 className="text-lg font-semibold text-yellow-400 mb-4 flex items-center gap-2">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    قيد التنفيذ ({processingJobs.length})
                                </h2>
                                <div className="space-y-4">
                                    {processingJobs.map((job) => (
                                        <JobCard key={job.id} job={job} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Completed Jobs */}
                        {completedJobs.length > 0 && (
                            <section>
                                <h2 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5" />
                                    مكتمل ({completedJobs.length})
                                </h2>
                                <div className="space-y-4">
                                    {completedJobs.map((job) => (
                                        <JobCard key={job.id} job={job} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Failed Jobs */}
                        {failedJobs.length > 0 && (
                            <section>
                                <h2 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
                                    <XCircle className="w-5 h-5" />
                                    فشل ({failedJobs.length})
                                </h2>
                                <div className="space-y-4">
                                    {failedJobs.map((job) => (
                                        <JobCard key={job.id} job={job} />
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </div>
        </div>
    );

    function JobCard({ job }: { job: JobHistory }) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 backdrop-blur-xl rounded-xl p-5 border border-white/20 hover:border-purple-500/50 transition-all cursor-pointer"
                onClick={() => router.push(`/?playlist=${job.playlistId}&job=${job.id}`)}
            >
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h3 className="text-white font-semibold text-lg mb-1">
                            {job.playlist?.title || 'Playlist'}
                        </h3>
                        <p className="text-gray-400 text-sm mb-3">
                            {job.videoIds.length} فيديو • {formatDate(job.createdAt)}
                        </p>

                        {job.status === 'PROCESSING' && job.currentStep && (
                            <p className="text-yellow-400 text-sm flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {job.currentStep}
                            </p>
                        )}

                        {job.status === 'PROCESSING' && (
                            <div className="mt-3">
                                <div className="w-full bg-white/10 rounded-full h-2">
                                    <div
                                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                                        style={{ width: `${job.progress}%` }}
                                    />
                                </div>
                                <p className="text-gray-400 text-xs mt-1">{job.progress}%</p>
                            </div>
                        )}
                    </div>

                    <div className={`px-3 py-1 rounded-full border text-sm flex items-center gap-2 ${getStatusColor(job.status)}`}>
                        {getStatusIcon(job.status)}
                        {getStatusText(job.status)}
                    </div>
                </div>
            </motion.div>
        );
    }
}
