import { type NextRequest, NextResponse } from "next/server"
import { getDynamicCategories } from "@/lib/dynamic-categories"
import { blogStore, videoStore } from "@/lib/content-store"

export async function GET(request: NextRequest) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://flavorstudios.in"

    // Static pages with their priorities
    const staticPages = [
      { url: "/", priority: "1.0", changefreq: "daily" },
      { url: "/blog", priority: "0.8", changefreq: "daily" },
      { url: "/watch", priority: "0.8", changefreq: "daily" },
      { url: "/about", priority: "0.6", changefreq: "monthly" },
      { url: "/contact", priority: "0.6", changefreq: "monthly" },
      { url: "/support", priority: "0.6", changefreq: "monthly" },
      { url: "/career", priority: "0.6", changefreq: "monthly" },
      { url: "/faq", priority: "0.6", changefreq: "monthly" },
      { url: "/play", priority: "0.5", changefreq: "monthly" },
      { url: "/legal", priority: "0.3", changefreq: "yearly" },
      { url: "/privacy-policy", priority: "0.3", changefreq: "yearly" },
      { url: "/terms-of-service", priority: "0.3", changefreq: "yearly" },
      { url: "/cookie-policy", priority: "0.3", changefreq: "yearly" },
      { url: "/disclaimer", priority: "0.3", changefreq: "yearly" },
      { url: "/dmca", priority: "0.3", changefreq: "yearly" },
      { url: "/media-usage-policy", priority: "0.3", changefreq: "yearly" },
    ]

    const dynamicPages: Array<{
      url: string
      priority: string
      changefreq: string
      lastmod?: string
    }> = []

    try {
      // Get dynamic categories for category pages
      const categories = await getDynamicCategories()
      categories.forEach((category) => {
        if (category.slug && category.slug !== "all") {
          // Add blog category pages
          dynamicPages.push({
            url: `/blog?category=${category.slug}`,
            priority: "0.6",
            changefreq: "weekly",
            lastmod: new Date().toISOString(),
          })
          // Add watch category pages
          dynamicPages.push({
            url: `/watch?category=${category.slug}`,
            priority: "0.6",
            changefreq: "weekly",
            lastmod: new Date().toISOString(),
          })
        }
      })
    } catch (error) {
      console.error("Error fetching categories for sitemap:", error)
    }

    try {
      // Get blog posts from content store
      const blogs = blogStore.getAllPosts()
      blogs.forEach((blog: any) => {
        if (blog.slug && blog.published) {
          dynamicPages.push({
            url: `/blog/${blog.slug}`,
            priority: "0.7",
            changefreq: "weekly",
            lastmod: blog.updatedAt || blog.publishedAt || blog.createdAt || new Date().toISOString(),
          })
        }
      })
    } catch (error) {
      console.error("Error fetching blogs for sitemap:", error)
    }

    try {
      // Get videos from content store
      const videos = videoStore.getAllVideos()
      videos.forEach((video: any) => {
        if (video.slug && video.published) {
          dynamicPages.push({
            url: `/watch/${video.slug}`,
            priority: "0.7",
            changefreq: "weekly",
            lastmod: video.updatedAt || video.publishedAt || video.createdAt || new Date().toISOString(),
          })
        }
      })
    } catch (error) {
      console.error("Error fetching videos for sitemap:", error)
    }

    // Generate XML sitemap
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
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`,
  )
  .join("\n")}
${dynamicPages
  .map(
    (page) => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${page.lastmod ? new Date(page.lastmod).toISOString() : new Date().toISOString()}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`

    return new NextResponse(sitemap, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
        "CDN-Cache-Control": "public, max-age=3600",
        "Vercel-CDN-Cache-Control": "public, max-age=3600",
      },
    })
  } catch (error) {
    console.error("Error generating sitemap:", error)

    // Return a basic sitemap with static pages only if there's an error
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://flavorstudios.in"
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/blog</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/watch</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`

    return new NextResponse(fallbackSitemap, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=300",
      },
    })
  }
}
