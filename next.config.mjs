// next.config.mjs

// Import the necessary modules
import withPWA from 'next-pwa';
import createNextIntlPlugin from 'next-intl/plugin';

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

const withNextIntl = createNextIntlPlugin('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Add this for best practice, optional
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: false },
  // No i18n property here for App Router compatibility
  // Add any other Next.js config here!
};

// Export the combined configuration with i18n and PWA wrappers
export default withNextIntl(pwaConfig(nextConfig));
