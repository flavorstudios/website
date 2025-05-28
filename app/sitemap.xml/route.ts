import { NextResponse } from "next/server"
import { getBlogPosts, getVideos } from "@/lib/content-store"
import { formatSitemapDate } from "@/lib/sitemap-utils"

const baseUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || "https://flavorstudios.in"

// Static pages with their priorities
const staticPages = [
  { url: "/", priority: 1.0, changefreq: "daily" },
  { url: "/blog", priority: 0.8, changefreq: "daily" },
  { url: "/watch", priority: 0.8, changefreq: "daily" },
  { url: "/about", priority: 0.6, changefreq: "weekly" },
  { url: "/contact", priority: 0.6, changefreq: "monthly" },
  { url: "/support", priority: 0.6, changefreq: "monthly" },
  { url: "/career", priority: 0.6, changefreq: "monthly" },
  { url: "/faq", priority: 0.6, changefreq: "monthly" },
  { url: "/legal", priority: 0.3, changefreq: "yearly" },
  { url: "/privacy-policy", priority: 0.3, changefreq: "yearly" },
  { url: "/terms-of-service", priority: 0.3, changefreq: "yearly" },
  { url: "/cookie-policy", priority: 0.3, changefreq: "yearly" },
  { url: "/disclaimer", priority: 0.3, changefreq: "yearly" },
  { url: "/dmca", priority: 0.3, changefreq: "yearly" },
  { url: "/media-usage-policy", priority: 0.3, changefreq: "yearly" },
]

export async function GET() {
  try {
    // Get dynamic content from content store
    const [blogs, videos] = await Promise.all([getBlogPosts().catch(() => []), getVideos().catch(() => [])])

    // Build sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${staticPages
  .map(
    (page) => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${formatSitemapDate(new Date())}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`,
  )
  .join("\n")}
${blogs
  .map(
    (blog) => `  <url>
    <loc>${baseUrl}/blog/${blog.slug}</loc>
    <lastmod>${formatSitemapDate(blog.updatedAt || blog.publishedAt)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`,
  )
  .join("\n")}
${videos
  .map(
    (video) => `  <url>
    <loc>${baseUrl}/watch/${video.youtubeId || video.id}</loc>
    <lastmod>${formatSitemapDate(video.updatedAt || video.publishedAt)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`

    return new NextResponse(sitemap, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    })
  } catch (error) {
    console.error("Error generating sitemap:", error)

    // Fallback sitemap with just static pages
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages
  .map(
    (page) => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${formatSitemapDate(new Date())}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`

    return new NextResponse(fallbackSitemap, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    })
  }
}
