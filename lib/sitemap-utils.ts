// lib/sitemap-utils.ts

export interface SitemapUrl {
  url: string;
  priority: string; // e.g. "0.5", "1.0"
  changefreq: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  lastmod?: string; // ISO 8601 (e.g. "2024-06-27T07:09:00Z")
}

// ---- UTILITY: Bulletproof URL joining (avoids double slashes/prefixes) ----
function joinUrl(base: string, path: string): string {
  const trimmed = path.trim();

  // Support values like "///https://example.com" where extra leading slashes are present
  const absoluteMatch = trimmed.match(/^\/+((?:https?:)?\/\/.*)$/i);
  if (absoluteMatch) {
    const [, absoluteUrl] = absoluteMatch;
    // Ensure protocol-relative values preserve the leading double slash
    if (absoluteUrl.startsWith("//")) {
      try {
        const baseUrl = new URL(base);
        const normalized = `//${absoluteUrl.replace(/^\/+/, "")}`;
        return `${baseUrl.protocol}${normalized}`;
      } catch {
        const normalized = `//${absoluteUrl.replace(/^\/+/, "")}`;
        return `https:${normalized}`;
      }
    }
    return absoluteUrl;
  }

  // Already an absolute URL with protocol
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  // Protocol-relative URLs (e.g. //cdn.example.com/path)
  if (trimmed.startsWith("//")) {
    try {
      const baseUrl = new URL(base);
      const normalized = `//${trimmed.replace(/^\/+/, "")}`;
      return `${baseUrl.protocol}${normalized}`;
    } catch {
      const normalized = `//${trimmed.replace(/^\/+/, "")}`;
      return `https:${normalized}`;
    }
  }

  try {
    // If 'path' is already an absolute URL (including other schemes), return as-is
    new URL(trimmed);
    return trimmed;
  } catch {
    // Relative path; join with base.
    const cleanBase = base.replace(/\/*$/, "");
    const cleanPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
    return `${cleanBase}${cleanPath}`;
  }
}

// ---- UTILITY: Convert to ISO8601 date string, or empty ----
function toISO8601(input: string | Date | null | undefined): string {
  if (!input) return "";
  if (typeof input === "string" && !isNaN(Date.parse(input))) return new Date(input).toISOString();
  if (input instanceof Date && !isNaN(input.getTime())) return input.toISOString();
  return "";
}

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function asRecord(value: unknown): UnknownRecord | null {
  return isRecord(value) ? value : null;
}

type CollectionKey = "posts" | "videos";

function extractCollectionItems(data: unknown, key: CollectionKey): unknown[] {
  if (Array.isArray(data)) {
    return data;
  }

  const record = asRecord(data);
  if (!record) {
    return [];
  }

  const nested = record[key];
  return Array.isArray(nested) ? nested : [];
}

function isPublished(entry: UnknownRecord): boolean {
  const rawStatus = entry.status;
  if (typeof rawStatus !== "string") {
    // Public API responses omit status entirely; treat as published in that case.
    return true;
  }

  const normalized = rawStatus.trim().toLowerCase();
  if (!normalized) {
    return true;
  }

  return normalized === "published";
}

function extractSlug(entry: UnknownRecord): string | null {
  const slug = entry.slug;
  if (typeof slug !== "string") {
    return null;
  }

  const trimmed = slug.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function extractLastmod(entry: UnknownRecord): string | undefined {
  const candidates = [entry.updatedAt, entry.publishedAt, entry.createdAt];

  for (const candidate of candidates) {
    if (candidate instanceof Date) {
      const iso = toISO8601(candidate);
      if (iso) return iso;
      continue;
    }

    if (typeof candidate === "number" && Number.isFinite(candidate)) {
      const iso = toISO8601(new Date(candidate));
      if (iso) return iso;
      continue;
    }

    if (typeof candidate === "string") {
      const iso = toISO8601(candidate);
      if (iso) return iso;
    }
  }

  return undefined;
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
    // Endpoint updated as per Codex suggestion
    const blogsResponse = await fetch(joinUrl(baseUrl, "/api/blogs"), {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" }
    });
    if (blogsResponse.ok) {
      const blogsData = await blogsResponse.json();
      const blogs = extractCollectionItems(blogsData, "posts");

      for (const blogEntry of blogs) {
        const record = asRecord(blogEntry);
        if (!record) {
          continue;
        }

        if (!isPublished(record)) {
          continue;
        }

        const slug = extractSlug(record);
        if (!slug) {
          continue;
        }

        const lastmod = extractLastmod(record);

        dynamicPages.push({
          url: `/blog/${slug}`,
          priority: "0.7",
          changefreq: "weekly",
          ...(lastmod ? { lastmod } : {}),
        });
      }
    } else {
      console.error("Error: Blog API returned status", blogsResponse.status);
    }
  } catch (error) {
    console.error("Error fetching blogs for sitemap:", error);
  }

  // --- Fetch Videos ---
  try {
    const videosResponse = await fetch(joinUrl(baseUrl, "/api/videos"), {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" }
    });
    if (videosResponse.ok) {
      const videosData = await videosResponse.json();
      const videos = extractCollectionItems(videosData, "videos");

      for (const videoEntry of videos) {
        const record = asRecord(videoEntry);
        if (!record) {
          continue;
        }

        if (!isPublished(record)) {
          continue;
        }

        const slug = extractSlug(record);
        if (!slug) {
          continue;
        }

        const lastmod = extractLastmod(record);

        dynamicPages.push({
          url: `/watch/${slug}`,
          priority: "0.7",
          changefreq: "weekly",
          ...(lastmod ? { lastmod } : {}),
        });
      }
    } else {
      console.error("Error: Video API returned status", videosResponse.status);
    }
  } catch (error) {
    console.error("Error fetching videos for sitemap:", error);
  }

  // --- Add more dynamic content here if needed (e.g., categories, paginated routes, etc.) ---

  return dynamicPages;
}
