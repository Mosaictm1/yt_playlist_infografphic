/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['img.youtube.com', 'i.ytimg.com', 'api.atlascloud.ai', 'atlas-media.oss-accelerate-overseas.aliyuncs.com'],
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
