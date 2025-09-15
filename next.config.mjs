// next.config.mjs

// Import the necessary modules
import bundleAnalyzer from '@next/bundle-analyzer';
// Load server-only environment variables (compiled from env/server.ts)
import { serverEnv } from './env/server.js';

const withBundleAnalyzer = bundleAnalyzer({ enabled: serverEnv.ANALYZE === 'true' });

// Next.js configuration
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Add this for best practice, optional
  eslint: { ignoreDuringBuilds: false },
  images: {
    // Next.js image optimization is enabled.
    // For static hosting, use a CDN (e.g., Cloudflare Images) or a custom loader.
    domains: [
      'storage.googleapis.com',
      'firebasestorage.googleapis.com',
      'flavorstudios.in',
    ],
  },

  async headers() {
    return [
      {
        source: '/admin/login',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
        ],
      },
    ];
  },

  serverRuntimeConfig: {
    BASE_URL: serverEnv.BASE_URL,
  },

  // Disable Next.js minification when NEXT_DISABLE_MINIFY=true
  webpack: (config) => {
    if (process.env.NEXT_DISABLE_MINIFY === 'true') {
      config.optimization.minimize = false;
    }
    return config;
  },

  // The `experimental.nodeMiddleware` flag was removed to ensure
  // compatibility with the stable Next.js release. Node.js middleware
  // currently requires the latest canary builds, so removing the flag
  // prevents build failures on stable versions. If Node.js middleware is
  // needed in the future, upgrade to a canary release and restore this flag.

  // Add any other Next.js config here!
};

// Export the configuration with optional bundle analysis.
export default withBundleAnalyzer(nextConfig);
