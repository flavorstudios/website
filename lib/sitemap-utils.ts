// lib/sitemap-utils.ts

export interface SitemapUrl {
  url: string
  priority: string
  changefreq: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never"
  lastmod?: string
}

// Normalize URL joining (avoid double slash)
function joinUrl(base: string, path: string): string {
  if (base.endsWith('/') && path.startsWith('/')) return base + path.slice(1)
  if (!base.endsWith('/') && !path.startsWith('/')) return base + '/' + path
  return base + path
}

export function generateSitemapXML(baseUrl: string, urls: SitemapUrl[]): string {
  const sitemapEntries = urls.map((page) => {
    const loc = joinUrl(baseUrl, page.url)
    const lastmodTag = page.lastmod
      ? `<lastmod>${new Date(page.lastmod).toISOString()}</lastmod>`
      : ''
    return `
  <url>
    <loc>${loc}</loc>
    ${lastmodTag}
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  }).join("")

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${sitemapEntries}
</urlset>`
}

// Static pages to always include in the main sitemap
export function getStaticPages(): SitemapUrl[] {
  return [
    { url: "/", priority: "1.0", changefreq: "daily" },
    { url: "/blog", priority: "0.8", changefreq: "daily" },
    { url: "/watch", priority: "0.8", changefreq: "daily" },
    { url: "/about", priority: "0.6", changefreq: "monthly" },
    { url: "/contact", priority: "0.6", changefreq: "monthly" },
    { url: "/support", priority: "0.6", changefreq: "monthly" },
    { url: "/career", priority: "0.6", changefreq: "monthly" },
    { url: "/faq", priority: "0.6", changefreq: "monthly" },
    { url: "/legal", priority: "0.3", changefreq: "yearly" },
    { url: "/privacy-policy", priority: "0.3", changefreq: "yearly" },
    { url: "/terms-of-service", priority: "0.3", changefreq: "yearly" },
    { url: "/cookie-policy", priority: "0.3", changefreq: "yearly" },
    { url: "/disclaimer", priority: "0.3", changefreq: "yearly" },
    { url: "/dmca", priority: "0.3", changefreq: "yearly" },
    { url: "/media-usage-policy", priority: "0.3", changefreq: "yearly" },
  ]
}

export async function fetchDynamicContent(baseUrl: string): Promise<SitemapUrl[]> {
  const dynamicPages: SitemapUrl[] = []

  // --- Fetch Blogs ---
  try {
    const blogsResponse = await fetch(joinUrl(baseUrl, '/api/admin/blogs'), {
      headers: { "Cache-Control": "no-cache" },
    })

    if (blogsResponse.ok) {
      const blogsData = await blogsResponse.json()
      const blogs = Array.isArray(blogsData.blogs) ? blogsData.blogs : []

      blogs.forEach((blog: Record<string, unknown>) => {
        if (blog.slug && blog.published) {
          dynamicPages.push({
            url: `/blog/${blog.slug}`,
            priority: "0.7",
            changefreq: "weekly",
            lastmod: String(blog.updatedAt || blog.publishedAt || blog.createdAt || ''),
          })
        }
      })
    } else {
      console.error("Error: Blog API returned status", blogsResponse.status)
    }
  } catch (error) {
    console.error("Error fetching blogs for sitemap:", error)
  }

  // --- Fetch Videos ---
  try {
    const videosResponse = await fetch(joinUrl(baseUrl, '/api/admin/videos'), {
      headers: { "Cache-Control": "no-cache" },
    })

    if (videosResponse.ok) {
      const videosData = await videosResponse.json()
      const videos = Array.isArray(videosData.videos) ? videosData.videos : []

      videos.forEach((video: Record<string, unknown>) => {
        if (video.slug && video.published) {
          dynamicPages.push({
            url: `/watch/${video.slug}`,
            priority: "0.7",
            changefreq: "weekly",
            lastmod: String(video.updatedAt || video.publishedAt || video.createdAt || ''),
          })
        }
      })
    } else {
      console.error("Error: Video API returned status", videosResponse.status)
    }
  } catch (error) {
    console.error("Error fetching videos for sitemap:", error)
  }

  return dynamicPages
}