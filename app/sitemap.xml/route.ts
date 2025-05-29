import { NextResponse } from "next/server"
import { blogStore, videoStore } from "@/lib/content-store"

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://flavorstudios.com"

    // Get dynamic content
    const [blogs, videos] = await Promise.all([
      blogStore.getPublished().catch(() => []),
      videoStore.getPublished().catch(() => []),
    ])

    // Static pages
    const staticPages = [
      { url: "", changefreq: "daily", priority: "1.0" },
      { url: "/about", changefreq: "monthly", priority: "0.8" },
      { url: "/watch", changefreq: "daily", priority: "0.9" },
      { url: "/blog", changefreq: "daily", priority: "0.9" },
      { url: "/contact", changefreq: "monthly", priority: "0.7" },
      { url: "/faq", changefreq: "monthly", priority: "0.6" },
      { url: "/career", changefreq: "monthly", priority: "0.6" },
      { url: "/support", changefreq: "monthly", priority: "0.6" },
      { url: "/play", changefreq: "weekly", priority: "0.7" },
      { url: "/legal", changefreq: "yearly", priority: "0.3" },
      { url: "/privacy-policy", changefreq: "yearly", priority: "0.3" },
      { url: "/terms-of-service", changefreq: "yearly", priority: "0.3" },
      { url: "/cookie-policy", changefreq: "yearly", priority: "0.3" },
      { url: "/disclaimer", changefreq: "yearly", priority: "0.3" },
      { url: "/dmca", changefreq: "yearly", priority: "0.3" },
      { url: "/media-usage-policy", changefreq: "yearly", priority: "0.3" },
    ]

    // Generate XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages
  .map(
    (page) => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`,
  )
  .join("\n")}
${blogs
  .map(
    (blog: any) => `  <url>
    <loc>${baseUrl}/blog/${blog.slug}</loc>
    <lastmod>${new Date(blog.updatedAt || blog.publishedAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`,
  )
  .join("\n")}
${videos
  .map(
    (video: any) => `  <url>
    <loc>${baseUrl}/watch/${video.id}</loc>
    <lastmod>${new Date(video.updatedAt || video.publishedAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
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

    // Fallback sitemap
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
