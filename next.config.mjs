// next.config.mjs

// Import the necessary modules
import withPWA from 'next-pwa';

/**
 * Configure Next.js PWA settings.
 * This function wraps your main Next.js configuration.
 */
const pwaConfig = withPWA({
  dest: 'public', // Destination directory for the service worker and manifest
  register: true, // Register the service worker
  skipWaiting: true, // Activate the new service worker immediately
  swSrc: 'app/sw.js', // Path to your custom service worker source file
  disable: process.env.NODE_ENV === 'development', // Disable PWA in development
  // 💡 Ensures /offline is ALWAYS precached for robust offline fallback
  additionalManifestEntries: [
    { url: '/offline', revision: null }, // Precache the offline page
  ],
  // Add other next-pwa options here if needed
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Add this for best practice, optional
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: false },
  // Add any other Next.js config here!
};

// Export the combined configuration, applying the PWA wrapper to the Next.js config.
export default pwaConfig(nextConfig);
