// app/blog/sitemap.xml/route.ts

import { NextResponse } from "next/server";
// import { blogStore } from "@/lib/comment-store"; // No longer needed!
import { generateSitemapXML, SitemapUrl } from "@/lib/sitemap-utils";
import { SITE_URL } from "@/lib/constants";
import { serverEnv } from "@/env/server";

const BASE_URL =
  serverEnv.NEXT_PUBLIC_BASE_URL ||
  serverEnv.BASE_URL ||
  SITE_URL ||
  "https://flavorstudios.in";

// Don't canonicalize here—just pass relative paths!
function toSitemapPage(page: Omit<SitemapUrl, "url"> & { url: string }): SitemapUrl {
  return { ...page, url: page.url };
}

interface ContentPage {
  slug: string;
  status?: "published" | "draft";
  updatedAt?: string;
  publishedAt?: string;
  createdAt?: string;
}

export async function GET() {
  const skipFetch =
    serverEnv.NODE_ENV === "test" ||
    serverEnv.TEST_MODE === "true" ||
    process.env.TEST_MODE === "true";
  try {
    // --- Fetch blogs via PUBLIC API ---
    let blogs: ContentPage[] = [];
    if (!skipFetch) {
      try {
        const res = await fetch(`${BASE_URL}/api/blogs`);
        if (res.ok) {
          blogs = await res.json();
        }
      } catch (err) {
        console.error("Failed to fetch blogs for sitemap:", err);
      }
    }

    // Always include root /blog
    const blogPages: SitemapUrl[] = [
      toSitemapPage({
        url: "/blog",
        changefreq: "weekly",
        priority: "0.5",
        lastmod: new Date().toISOString(),
      }),
    ];

    // All individual blog posts (only relative URLs!)
    if (Array.isArray(blogs) && blogs.length > 0) {
      for (const blog of blogs as ContentPage[]) {
        if (
          blog.slug &&
          blog.slug !== "blog" &&
          (!blog.status || blog.status === "published")
        ) {
          blogPages.push(
            toSitemapPage({
              url: `/blog/${blog.slug}`,
              changefreq: "weekly",
              priority: "0.8",
              lastmod: blog.updatedAt || blog.publishedAt || blog.createdAt,
            })
          );
        }
      }
    }

    const xml = generateSitemapXML(BASE_URL, blogPages);

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    if (skipFetch) {
      console.warn("Blog sitemap generation skipped or failed:", error);
    } else {
      console.error("Blog sitemap generation failed:", error);
    }
    const now = new Date().toISOString();
    const fallbackXml = generateSitemapXML(BASE_URL, [
      { url: "/blog", changefreq: "weekly", priority: "0.5", lastmod: now },
    ]);
    return new NextResponse(fallbackXml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=1800, s-maxage=1800, stale-while-revalidate=3600",
      },
    });
  }
}
