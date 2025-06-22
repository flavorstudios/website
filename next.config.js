/** @type {import('next').NextConfig} */
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  swSrc: "public/sw-custom.js", // Custom service worker logic (this is all you need!)
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