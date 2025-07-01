/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  swSrc: 'app/sw.js', // This is your service worker source template!
  disable: process.env.NODE_ENV === 'development',
  // 💡 This guarantees /offline is ALWAYS precached (so offline fallback never fails)
  additionalManifestEntries: [
    { url: '/offline', revision: null },
  ],
});

const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: false },
  // Add more Next.js config if needed!
};

module.exports = withPWA(nextConfig);
