import { NextResponse } from "next/server"
import { blogStore, videoStore } from "@/lib/content-store"
import { categoryStore } from "@/lib/category-store"

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://flavorstudios.com"

    // Get dynamic content with error handling
    const [blogs, videos, categories] = await Promise.all([
      blogStore.getPublished().catch(() => []),
      videoStore.getPublished().catch(() => []),
      categoryStore.getAll().catch(() => []),
    ])

    // Static pages with proper lastmod dates
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

    // Dynamic blog pages
    const blogPages = blogs.map((blog: any) => ({
      url: `/blog/${blog.slug}`,
      changefreq: "weekly",
      priority: "0.8",
      lastmod: new Date(blog.updatedAt || blog.publishedAt).toISOString(),
    }))

    // Dynamic video pages
    const videoPages = videos.map((video: any) => ({
      url: `/watch/${video.slug || video.id}`,
      changefreq: "weekly",
      priority: "0.8",
      lastmod: new Date(video.updatedAt || video.publishedAt).toISOString(),
    }))

    // Category pages
    const categoryPages = categories.flatMap((category: any) => [
      {
        url: `/blog?category=${category.slug}`,
        changefreq: "weekly",
        priority: "0.7",
        lastmod: new Date().toISOString(),
      },
      {
        url: `/watch?category=${category.slug}`,
        changefreq: "weekly",
        priority: "0.7",
        lastmod: new Date().toISOString(),
      },
    ])

    // Combine all pages
    const allPages = [...staticPages, ...blogPages, ...videoPages, ...categoryPages]

    // Generate XML sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    (page) => `  <url>
    <loc>${baseUrl}${page.url}</loc>
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

    // Fallback sitemap with essential pages
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://flavorstudios.com"
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/about</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/watch</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/blog</loc>
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
