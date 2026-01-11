/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: [
            'img.youtube.com',
            'i.ytimg.com',
            'api.atlascloud.ai',
            'atlas-media.oss-accelerate-overseas.aliyuncs.com',
            'atlas-media.oss-accelerate.aliyuncs.com',
            'atlas-img.oss-accelerate.aliyuncs.com',
        ],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**.youtube.com',
            },
            {
                protocol: 'https',
                hostname: '**.ytimg.com',
            },
            {
                protocol: 'https',
                hostname: '**.aliyuncs.com',
            },
            {
                protocol: 'https',
                hostname: '**.atlascloud.ai',
            },
            {
                protocol: 'https',
                hostname: '**.oss-accelerate-overseas.aliyuncs.com',
            },
            {
                protocol: 'https',
                hostname: '**.oss-accelerate.aliyuncs.com',
            },
        ],
    },
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/:path*`,
            },
        ];
    },
};

module.exports = nextConfig;
