/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_TOGETHER_API_KEY: process.env.NEXT_PUBLIC_TOGETHER_API_KEY,
  },
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;
