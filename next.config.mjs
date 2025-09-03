// next.config.mjs

// Import the necessary modules
import bundleAnalyzer from '@next/bundle-analyzer';
import { serverEnv } from './env/server.js';

const withBundleAnalyzer = bundleAnalyzer({ enabled: serverEnv.ANALYZE === 'true' });

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

  async headers() {
    return [];
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
