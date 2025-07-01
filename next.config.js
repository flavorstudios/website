/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  swSrc: 'app/sw.js', // This is your source template!
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: false },
  // Add more Next.js config if needed!
};

module.exports = withPWA(nextConfig);
