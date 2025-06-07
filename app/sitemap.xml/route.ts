import { NextResponse } from "next/server"
import { blogStore, videoStore } from "@/lib/content-store"
import { categoryStore } from "@/lib/category-store"

// Canonical .in domain (never .com)
const BASE_URL = "https://flavorstudios.in"

// Static pages (all essential, main site structure)
const staticPages = [
  { url: "", changefreq: "daily", priority: "1.0", lastmod: new Date().toISOString() },
  { url: "/about", changefreq: "monthly", priority: "0.8", lastmod: new Date().toISOString() },
  { url: "/watch", changefreq: "daily", priority: "0.9", lastmod: new Date().toISOString() },
  { url: "/blog", changefreq: "daily", priority: "0.9", lastmod: new Date().toISOString() },
  { url: "/contact", changefreq: "monthly", priority: "0.7", lastmod: new Date().toISOString() },
  { url: "/faq", changefreq: "monthly", priority: "0.6", lastmod: new Date().toISOString() },
  { url: "/career", changefreq: "monthly", priority: "0.6", lastmod: new Date().toISOString() },
  { url: "/support", changefreq: "monthly", priority: "0.6", lastmod: new Date().toISOString() },
  { url: "/play", changefreq: "weekly", priority: "0.7", lastmod: new Date().toISOString() },
  { url: "/legal", changefreq: "yearly", priority: "0.3", lastmod: new Date().toISOString() },
  { url: "/privacy-policy", changefreq: "yearly", priority: "0.3", lastmod: new Date().toISOString() },
  { url: "/terms-of-service", changefreq: "yearly", priority: "0.3", lastmod: new Date().toISOString() },
  { url: "/cookie-policy", changefreq: "yearly", priority: "0.3", lastmod: new Date().toISOString() },
  { url: "/disclaimer", changefreq: "yearly", priority: "0.3", lastmod: new Date().toISOString() },
  { url: "/dmca", changefreq: "yearly", priority: "0.3", lastmod: new Date().toISOString() },
  { url: "/media-usage-policy", changefreq: "yearly", priority: "0.3", lastmod: new Date().toISOString() },
]

export async function GET() {
  try {
    // Fetch published blog posts and videos
    const [blogs, videos] = await Promise.all([
      blogStore.getPublished().catch(() => []),
      videoStore.getPublished().catch(() => []),
    ])

    // Dynamic blog post URLs
    const blogPages = blogs.map((blog: any) => ({
      url: `/blog/${blog.slug}`,
      changefreq: "weekly",
      priority: "0.8",
      lastmod: new Date(blog.updatedAt || blog.publishedAt || blog.createdAt).toISOString(),
    }))

    // Dynamic video URLs
    const videoPages = videos.map((video: any) => ({
      url: `/watch/${video.slug || video.id}`,
      changefreq: "weekly",
      priority: "0.8",
      lastmod: new Date(video.updatedAt || video.publishedAt || video.createdAt).toISOString(),
    }))

    // Combine all URLs (no category?category= in sitemaps—just real pages)
    const allPages = [...staticPages, ...blogPages, ...videoPages]

    // Generate the sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    (page) => `  <url>
    <loc>${BASE_URL}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`

    return new NextResponse(sitemap, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    })
  } catch (error) {
    console.error("Error generating sitemap:", error)

    // Fallback: Only homepage, about, watch, blog
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${BASE_URL}/about</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${BASE_URL}/watch</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${BASE_URL}/blog</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`

    return new NextResponse(fallbackSitemap, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=1800, s-maxage=1800",
      },
    })
  }
}
