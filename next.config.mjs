// next.config.mjs

// Import the necessary modules
import fs from 'node:fs';
import path from 'node:path';
import bundleAnalyzer from '@next/bundle-analyzer';
import imageDomains from './config/image-domains.json' with { type: 'json' };
// Access server-only environment variables directly
const { ANALYZE } = process.env;

const withBundleAnalyzer = bundleAnalyzer({ enabled: ANALYZE === 'true' });

const remoteImagePatterns = imageDomains.map((hostname) => ({
  protocol: 'https',
  hostname,
}));

// Next.js configuration
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Add this for best practice, optional
  allowedDevOrigins: ["http://127.0.0.1:3000", "http://localhost:3000"],
  eslint: { ignoreDuringBuilds: false },
  images: {
    // Next.js image optimization is enabled.
    // For static hosting, use a CDN (e.g., Cloudflare Images) or a custom loader.
    remotePatterns: remoteImagePatterns,
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

  // Disable Next.js minification when NEXT_DISABLE_MINIFY is set
   webpack: (config) => {
    if (process.env.NEXT_DISABLE_MINIFY === 'true') {
      config.optimization = config.optimization ?? {};
      config.optimization.minimize = false;
    }

    const hasSrc = fs.existsSync(path.join(process.cwd(), 'src'));
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      '@': hasSrc
        ? path.resolve(process.cwd(), 'src')
        : path.resolve(process.cwd()),
    };
    
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
