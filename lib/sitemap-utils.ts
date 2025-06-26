// lib/sitemap-utils.ts

export interface SitemapUrl {
  url: string;
  priority: string; // Sitemap priority: "0.5", "1.0", etc.
  changefreq: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  lastmod?: string; // ISO 8601 (e.g. "2024-06-27T07:09:00Z")
}

// ---- UTILITY: Normalized URL joining (avoids double slashes) ----
function joinUrl(base: string, path: string): string {
  const cleanBase = base.replace(/\/+$/, "");         // remove trailing slashes from base
  const cleanPath = path.startsWith("/") ? path : `/${path}`; // ensure path starts with one slash
  return `${cleanBase}${cleanPath}`;
}

// ---- UTILITY: Cast any date-like value to valid ISO8601 string, or empty string ----
function toISO8601(input: any): string {
  if (!input) return "";
  if (typeof input === "string" && !isNaN(Date.parse(input))) return new Date(input).toISOString();
  if (input instanceof Date && !isNaN(input.getTime())) return input.toISOString();
  return "";
}

// ---- GENERATE SITEMAP XML ----
export function generateSitemapXML(baseUrl: string, urls: SitemapUrl[]): string {
  const sitemapEntries = urls.map((page) => {
    const loc = joinUrl(baseUrl, page.url);
    const lastmodISO = toISO8601(page.lastmod);
    const lastmodTag = lastmodISO ? `<lastmod>${lastmodISO}</lastmod>` : "";
    return `
  <url>
    <loc>${loc}</loc>
    ${lastmodTag}
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
  }).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${sitemapEntries}
</urlset>`;
}

// ---- STATIC PAGES: Always included ----
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
  ];
}

// ---- DYNAMIC CONTENT: Blogs and Videos (extendable) ----
export async function fetchDynamicContent(baseUrl: string): Promise<SitemapUrl[]> {
  const dynamicPages: SitemapUrl[] = [];

  // --- Fetch Blogs ---
  try {
    const blogsResponse = await fetch(joinUrl(baseUrl, "/api/admin/blogs"), {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" }
    });
    if (blogsResponse.ok) {
      const blogsData = await blogsResponse.json();
      const blogs = Array.isArray(blogsData.posts) ? blogsData.posts : [];
      blogs.forEach((blog: any) => {
        if (blog.slug && blog.status === "published") {
          dynamicPages.push({
            url: `/blog/${blog.slug}`,
            priority: "0.7",
            changefreq: "weekly",
            lastmod: toISO8601(blog.updatedAt || blog.publishedAt || blog.createdAt)
          });
        }
      });
    } else {
      console.error("Error: Blog API returned status", blogsResponse.status);
    }
  } catch (error) {
    console.error("Error fetching blogs for sitemap:", error);
  }

  // --- Fetch Videos ---
  try {
    const videosResponse = await fetch(joinUrl(baseUrl, "/api/admin/videos"), {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" }
    });
    if (videosResponse.ok) {
      const videosData = await videosResponse.json();
      const videos = Array.isArray(videosData.videos) ? videosData.videos : [];
      videos.forEach((video: any) => {
        if (video.slug && video.status === "published") {
          dynamicPages.push({
            url: `/watch/${video.slug}`,
            priority: "0.7",
            changefreq: "weekly",
            lastmod: toISO8601(video.updatedAt || video.publishedAt || video.createdAt)
          });
        }
      });
    } else {
      console.error("Error: Video API returned status", videosResponse.status);
    }
  } catch (error) {
    console.error("Error fetching videos for sitemap:", error);
  }

  // // --- Add more dynamic content here if needed (e.g., categories, paginated routes, etc.) ---

  return dynamicPages;
}
