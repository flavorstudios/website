/** @type {import('next').NextConfig} */
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  swSrc: "public/sw.js", // Correct: points to your real, combined SW!
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
