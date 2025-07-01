/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  swSrc: 'app/sw.js', // This is your service worker source template!
  disable: process.env.NODE_ENV === 'development',
  // 💡 Ensures /offline is ALWAYS precached for robust offline fallback
  additionalManifestEntries: [
    { url: '/offline', revision: null },
  ],
});

const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: false },
  // Add any other Next.js config here!
};

module.exports = withPWA(nextConfig);
