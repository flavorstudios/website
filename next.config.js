/** @type {import('next').NextConfig} */
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  injectManifest: true, // 👈 Required for custom SW logic!
  swSrc: "public/sw-custom.js", // Custom service worker logic
  disable: process.env.NODE_ENV === "development", // Only enable PWA in production
});

const nextConfig = withPWA({
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: false, // Image optimization ENABLED!
  },
  // Add more Next.js config as needed, nothing removed!
});

module.exports = nextConfig;