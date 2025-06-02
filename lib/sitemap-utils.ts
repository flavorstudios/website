export interface SitemapUrl {
  url: string
  priority: string
  changefreq: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never"
  lastmod?: string

  // For Google News
  news?: {
    publicationName: string
    publicationLanguage: string // "en" for English, "hi" for Hindi, etc.
    title: string
    publicationDate: string // ISO date string
  }

  // For Images
  images?: { loc: string; title?: string; caption?: string }[]
}

export function generateSitemapXML(baseUrl: string, urls: SitemapUrl[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
  xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
  xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${urls
  .map(
    (page) => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${page.lastmod ? new Date(page.lastmod).toISOString() : new Date().toISOString()}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
${page.news
  ? `    <news:news>
      <news:publication>
        <news:name>${escapeXml(page.news.publicationName)}</news:name>
        <news:language>${escapeXml(page.news.publicationLanguage)}</news:language>
      </news:publication>
      <news:publication_date>${new Date(page.news.publicationDate).toISOString()}</news:publication_date>
      <news:title>${escapeXml(page.news.title)}</news:title>
    </news:news>`
  : ""}
${page.images?.length
  ? page.images
      .map(
        (img) => `    <image:image>
      <image:loc>${escapeXml(img.loc)}</image:loc>
      ${img.title ? `<image:title>${escapeXml(img.title)}</image:title>` : ""}
      ${img.caption ? `<image:caption>${escapeXml(img.caption)}</image:caption>` : ""}
    </image:image>`
      )
      .join("\n")
  : ""}
  </url>`
  )
  .join("\n")}
</urlset>`
}

// Helper to escape XML special chars
function escapeXml(unsafe: string) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

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

  try {
    // Fetch blog posts
    const blogsResponse = await fetch(`${baseUrl}/api/admin/blogs`, {
      headers: { "Cache-Control": "no-cache" },
    })

    if (blogsResponse.ok) {
      const blogsData = await blogsResponse.json()
      const blogs = blogsData.blogs || []

      blogs.forEach((blog: any) => {
        if (blog.slug && blog.published) {
          dynamicPages.push({
            url: `/blog/${blog.slug}`,
            priority: "0.7",
            changefreq: "weekly",
            lastmod: blog.updatedAt || blog.publishedAt || blog.createdAt,
            // Add images array if present (adapt as needed!)
            images: Array.isArray(blog.images)
              ? blog.images.map((img: any) => ({
                  loc: img.url || img.loc, // adapt property name to your data!
                  title: img.title,
                  caption: img.caption,
                }))
              : [],
            // Add Google News info for news posts
            news: blog.isNews
              ? {
                  publicationName: "Flavor Studios Anime News",
                  publicationLanguage: "en",
                  title: blog.title,
                  publicationDate: blog.publishedAt || blog.createdAt,
                }
              : undefined,
          })
        }
      })
    }
  } catch (error) {
    console.error("Error fetching blogs for sitemap:", error)
  }

  try {
    // Fetch videos
    const videosResponse = await fetch(`${baseUrl}/api/admin/videos`, {
      headers: { "Cache-Control": "no-cache" },
    })

    if (videosResponse.ok) {
      const videosData = await videosResponse.json()
      const videos = videosData.videos || []

      videos.forEach((video: any) => {
        if (video.slug && video.published) {
          dynamicPages.push({
            url: `/watch/${video.slug}`,
            priority: "0.7",
            changefreq: "weekly",
            lastmod: video.updatedAt || video.publishedAt || video.createdAt,
            images: Array.isArray(video.images)
              ? video.images.map((img: any) => ({
                  loc: img.url || img.loc,
                  title: img.title,
                  caption: img.caption,
                }))
              : [],
          })
        }
      })
    }
  } catch (error) {
    console.error("Error fetching videos for sitemap:", error)
  }

  return dynamicPages
}
