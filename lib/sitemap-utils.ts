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

  // For Video
  video?: {
    title: string
    description: string
    content_loc: string      // YouTube or direct link
    thumbnail_loc: string
    publication_date?: string
    duration?: number        // In seconds (optional)
  }
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
${page.video
  ? `    <video:video>
      <video:thumbnail_loc>${escapeXml(page.video.thumbnail_loc)}</video:thumbnail_loc>
      <video:title>${escapeXml(page.video.title)}</video:title>
      <video:description>${escapeXml(page.video.description)}</video:description>
      <video:content_loc>${escapeXml(page.video.content_loc)}</video:content_loc>
      ${page.video.publication_date ? `<video:publication_date>${new Date(page.video.publication_date).toISOString()}</video:publication_date>` : ""}
      ${page.video.duration ? `<video:duration>${page.video.duration}</video:duration>` : ""}
    </video:video>`
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

// (fetchDynamicContent stays the same, but now you can return video/news/images as needed)
