/** @type {import('next').NextConfig} */
const withBundleAnalyzer =
  require('@next/bundle-analyzer')({ enabled: process.env.ANALYZE === 'true' });

module.exports = withBundleAnalyzer({
  experimental: { typedRoutes: true }
});
