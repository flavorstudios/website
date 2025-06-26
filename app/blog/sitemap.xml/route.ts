// app/blog/sitemap.xml/route.ts

import { NextResponse } from "next/server";
import { blogStore } from "@/lib/content-store"; // Assuming blogStore.getPublished() internally uses fetch with cache: 'no-store'
import { generateSitemapXML, SitemapUrl } from "@/lib/sitemap-utils";
import { getCanonicalUrl } from "@/lib/seo-utils";
import { SITE_URL } from "@/lib/constants";

// Resolve base URL with all fallbacks for robustness across environments
const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ||
  process.env.BASE_URL ||
  SITE_URL ||
  "https://flavorstudios.in";

// Helper function to canonicalize a SitemapUrl object's URL.
// Ensures consistent absolute and canonical URLs in the sitemap.
function toCanonicalSitemapPage(
  page: Omit<SitemapUrl, "url"> & { url: string }
): SitemapUrl {
  return {
    ...page,
    url: getCanonicalUrl(page.url),
  };
}

// Interface for content items, providing type safety for blog posts.
interface ContentPage {
  slug: string;
  status?: "published" | "draft"; // Status is optional for compatibility with legacy content without explicit status.
  updatedAt?: string;
  publishedAt?: string;
  createdAt?: string;
}

export async function GET() {
  try {
    // Fetch all published blog posts. The .catch(() => []) ensures that
    // sitemap generation doesn't completely fail if the blogStore API call errors.
    const blogs = await blogStore.getPublished().catch(() => []);

    // Initialize the list of blog pages for the sitemap.
    // Always include the canonical /blog root page as a starting point.
    const blogPages: SitemapUrl[] = [
      toCanonicalSitemapPage({
        url: "/blog",
        changefreq: "weekly", // The blog index page itself might update weekly.
        priority: "0.5",     // Lower priority than individual posts, but still important.
        lastmod: new Date().toISOString(), // Use current date as lastmod for the index page.
      }),
    ];

    // Add each published blog post to the sitemap.
    // Iterates through fetched blogs, applies filtering for valid slugs and published status.
    if (Array.isArray(blogs) && blogs.length > 0) {
      for (const blog of blogs as ContentPage[]) {
        // Only include if slug is valid, not equal to "blog" (to avoid duplicate with root),
        // and either has no status (legacy) or is explicitly "published".
        if (
          blog.slug &&
          blog.slug !== "blog" &&
          (!blog.status || blog.status === "published")
        ) {
          blogPages.push(
            toCanonicalSitemapPage({
              url: `/blog/${blog.slug}`,
              changefreq: "weekly", // Individual posts are often updated weekly or less frequently.
              priority: "0.8",     // Higher priority than static pages, as content updates more often.
              // Use the most recent of updatedAt, publishedAt, or createdAt for lastmod.
              lastmod: blog.updatedAt || blog.publishedAt || blog.createdAt,
            })
          );
        }
      }
    }

    // Generate the final XML string for the blog sitemap.
    const xml = generateSitemapXML(BASE_URL, blogPages);

    // Return the XML response with appropriate headers for XML content and caching.
    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        // Cache-Control headers for public caching (browser, CDN).
        // max-age/s-maxage: 1 hour fresh.
        // stale-while-revalidate: allows serving stale for up to 1 day while fetching fresh in background.
        "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400", // Added stale-while-revalidate
      },
    });
  } catch (error) {
    // Fallback: If sitemap generation fails, provide a minimal valid sitemap for resilience.
    console.error("Blog sitemap generation failed:", error);

    const now = new Date().toISOString(); // Use current time for lastmod in fallback.
    const fallbackXml = generateSitemapXML(BASE_URL, [
      toCanonicalSitemapPage({
        url: "/blog",
        changefreq: "weekly",
        priority: "0.5",
        lastmod: now,
      }),
    ]);

    // Return the fallback sitemap with slightly shorter caching, but still resilient.
    return new NextResponse(fallbackXml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        // Shorter max-age/s-maxage for fallback, with stale-while-revalidate.
        "Cache-Control": "public, max-age=1800, s-maxage=1800, stale-while-revalidate=3600", // Added stale-while-revalidate
      },
    });
  }
}
