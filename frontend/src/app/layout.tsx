import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import Providers from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'YouTube Playlist to Infographic Generator',
    description: 'تحويل فيديوهات YouTube إلى صور Infographic باستخدام الذكاء الاصطناعي',
    keywords: ['YouTube', 'Infographic', 'AI', 'Generator'],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ar" dir="rtl">
            <body className={inter.className}>
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    );
}
