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

// Next.js configuration
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

  // The `experimental.nodeMiddleware` flag was removed to ensure
  // compatibility with the stable Next.js release. Node.js middleware
  // currently requires the latest canary builds, so removing the flag
  // prevents build failures on stable versions. If Node.js middleware is
  // needed in the future, upgrade to a canary release and restore this flag.

  // Add any other Next.js config here!
};

// Export the combined configuration, applying the PWA wrapper to the Next.js config.
export default withBundleAnalyzer(pwaConfig(nextConfig));
