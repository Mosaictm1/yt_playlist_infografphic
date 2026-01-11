'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function SettingsPage() {
    const { user, loading, getAccessToken, refreshUser, signOut } = useAuth();
    const router = useRouter();

    const [apifyApiToken, setApifyApiToken] = useState('');
    const [geminiApiKey, setGeminiApiKey] = useState('');
    const [atlasCloudApiKey, setAtlasCloudApiKey] = useState('');
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [loading, user, router]);

    const handleSaveKeys = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const token = await getAccessToken();
            const response = await fetch(`${apiUrl}/auth/api-keys`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    apifyApiToken: apifyApiToken || null,
                    geminiApiKey: geminiApiKey || null,
                    atlasCloudApiKey: atlasCloudApiKey || null,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ type: 'success', text: 'تم حفظ المفاتيح بنجاح!' });
                await refreshUser();
                // Clear inputs after save
                setApifyApiToken('');
                setGeminiApiKey('');
                setAtlasCloudApiKey('');
            } else {
                setMessage({ type: 'error', text: data.error || 'فشل حفظ المفاتيح' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'حدث خطأ أثناء حفظ المفاتيح' });
        } finally {
            setSaving(false);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        router.push('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="text-white text-xl">جاري التحميل...</div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <Link
                        href="/"
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        → العودة للرئيسية
                    </Link>
                    <button
                        onClick={handleSignOut}
                        className="px-4 py-2 text-red-400 hover:text-red-300 transition-colors"
                    >
                        تسجيل الخروج
                    </button>
                </div>

                {/* Profile Card */}
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl mb-6">
                    <h2 className="text-xl font-bold text-white mb-4">الملف الشخصي</h2>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-400">البريد الإلكتروني</span>
                            <span className="text-white">{user.email}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">الاسم</span>
                            <span className="text-white">{user.name || 'غير محدد'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">الخطة</span>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${user.plan === 'PAID'
                                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                                    : 'bg-gray-600 text-gray-200'
                                }`}>
                                {user.plan === 'PAID' ? '⭐ مدفوعة' : 'مجانية'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* API Keys Card - Only for FREE users */}
                {user.plan === 'FREE' && (
                    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl">
                        <h2 className="text-xl font-bold text-white mb-2">مفاتيح API</h2>
                        <p className="text-gray-400 text-sm mb-6">
                            الخطة المجانية تتطلب إدخال مفاتيح API الخاصة بك لاستخدام التطبيق
                        </p>

                        {/* Current status */}
                        <div className="bg-white/5 rounded-xl p-4 mb-6">
                            <h3 className="text-gray-300 text-sm font-medium mb-3">حالة المفاتيح:</h3>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="text-center">
                                    <div className={`text-2xl mb-1 ${user.hasApiKeys.apifyApiToken ? '✅' : '❌'}`}>
                                        {user.hasApiKeys.apifyApiToken ? '✅' : '❌'}
                                    </div>
                                    <p className="text-xs text-gray-400">Apify</p>
                                </div>
                                <div className="text-center">
                                    <div className={`text-2xl mb-1 ${user.hasApiKeys.geminiApiKey ? '✅' : '❌'}`}>
                                        {user.hasApiKeys.geminiApiKey ? '✅' : '❌'}
                                    </div>
                                    <p className="text-xs text-gray-400">Gemini</p>
                                </div>
                                <div className="text-center">
                                    <div className={`text-2xl mb-1 ${user.hasApiKeys.atlasCloudApiKey ? '✅' : '❌'}`}>
                                        {user.hasApiKeys.atlasCloudApiKey ? '✅' : '❌'}
                                    </div>
                                    <p className="text-xs text-gray-400">Atlas Cloud</p>
                                </div>
                            </div>
                        </div>

                        {message.text && (
                            <div className={`rounded-lg p-4 mb-6 ${message.type === 'success'
                                    ? 'bg-green-500/20 border border-green-500/50'
                                    : 'bg-red-500/20 border border-red-500/50'
                                }`}>
                                <p className={`text-sm text-center ${message.type === 'success' ? 'text-green-300' : 'text-red-300'
                                    }`}>
                                    {message.text}
                                </p>
                            </div>
                        )}

                        <form onSubmit={handleSaveKeys} className="space-y-4">
                            <div>
                                <label className="block text-gray-300 text-sm font-medium mb-2">
                                    Apify API Token
                                </label>
                                <input
                                    type="password"
                                    value={apifyApiToken}
                                    onChange={(e) => setApifyApiToken(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    placeholder={user.hasApiKeys.apifyApiToken ? '••••••••' : 'apify_api_xxxxx'}
                                    dir="ltr"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-300 text-sm font-medium mb-2">
                                    Gemini API Key
                                </label>
                                <input
                                    type="password"
                                    value={geminiApiKey}
                                    onChange={(e) => setGeminiApiKey(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    placeholder={user.hasApiKeys.geminiApiKey ? '••••••••' : 'AIza...'}
                                    dir="ltr"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-300 text-sm font-medium mb-2">
                                    Atlas Cloud API Key
                                </label>
                                <input
                                    type="password"
                                    value={atlasCloudApiKey}
                                    onChange={(e) => setAtlasCloudApiKey(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    placeholder={user.hasApiKeys.atlasCloudApiKey ? '••••••••' : 'apikey-xxxxx'}
                                    dir="ltr"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? 'جاري الحفظ...' : 'حفظ المفاتيح'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Paid Plan Info */}
                {user.plan === 'PAID' && (
                    <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-xl rounded-2xl p-6 border border-yellow-500/30 shadow-2xl">
                        <h2 className="text-xl font-bold text-white mb-2">⭐ خطة مدفوعة</h2>
                        <p className="text-gray-300">
                            أنت على الخطة المدفوعة، لا تحتاج إلى إدخال مفاتيح API.
                            استمتع بجميع الميزات بدون قيود!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
