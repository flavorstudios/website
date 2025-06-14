/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://flavorstudios.in',
  generateRobotsTxt: true, // (optional)
  sitemapSize: 7000,
  changefreq: 'weekly',
  priority: 0.7,
  outDir: 'public',
  // Optionally configure extra sitemaps
  additionalSitemaps: [
    'https://flavorstudios.in/blog/sitemap.xml',
    'https://flavorstudios.in/watch/sitemap.xml',
  ],
};