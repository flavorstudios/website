// next.config.mjs

// Import the necessary modules
import withPWA from 'next-pwa';
import bundleAnalyzer from '@next/bundle-analyzer';

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

const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === 'true' });

// Enable Node.js runtime middleware support to remove build warnings
// Node.js middleware is now applied in all environments including production/CI.
// If needed, adjust environment checks here for specific deployment targets.

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Add this for best practice, optional
  eslint: { ignoreDuringBuilds: true },
  images: {
    // Disable Next.js image optimization so remote URLs are loaded directly.
    // This avoids 4xx/5xx errors when the optimizer endpoint isn't available
    // on the hosting platform (e.g., static deployments behind Cloudflare).
    unoptimized: true,
    domains: ['storage.googleapis.com', 'firebasestorage.googleapis.com'],
  },

  // Enable Node.js runtime support for middleware in all environments
  experimental: { nodeMiddleware: true },

  // Add any other Next.js config here!
};

// Export the combined configuration, applying the PWA wrapper to the Next.js config.
export default withBundleAnalyzer(pwaConfig(nextConfig));
