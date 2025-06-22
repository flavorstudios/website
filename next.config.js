/** @type {import('next').NextConfig} */
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development", // Only enable PWA in production
  // 👉 Point to your custom SW source file
  swSrc: "public/sw-custom.js", // Custom service worker logic
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