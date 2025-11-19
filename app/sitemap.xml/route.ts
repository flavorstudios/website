import { NextRequest } from "next/server";
import { getStaticPages, generateSitemapXML, SitemapUrl } from "@/lib/sitemap-utils";
import { serverEnv } from "@/env/server";
import { canonicalBaseUrl } from "@/lib/base-url";
import { buildExternalApiUrl } from "@/lib/api/external";
import { createRequestContext, textResponse } from "@/lib/api/response";
import { logError } from "@/lib/log";
import { isTestMode } from "@/config/flags";

const BASE_URL = canonicalBaseUrl();

function toSitemapPage(page: Omit<SitemapUrl, "url"> & { url: string }): SitemapUrl {
  return { ...page, url: page.url };
}

interface ContentPage {
  slug: string;
  status: "published" | "draft";
  updatedAt?: string;
  publishedAt?: string;
  createdAt?: string;
}

export const revalidate = 3600;

export async function GET(request: NextRequest) {
  const context = createRequestContext(request);
  const skipFetch = serverEnv.NODE_ENV === "test" || isTestMode();

  try {
    let blogs: ContentPage[] = [];
    let videos: ContentPage[] = [];
    
    if (!skipFetch) {
      try {
        const res = await fetch(buildExternalApiUrl(`/posts`), {
          cache: "no-store",
        });
        if (res.ok) {
          blogs = await res.json();
        }
      } catch (error) {
        logError("sitemap:blogs", error, { requestId: context.requestId });
      }

      try {
        const res = await fetch(buildExternalApiUrl(`/videos`), {
          cache: "no-store",
        });
        if (res.ok) {
          videos = await res.json();
        }
      } catch (error) {
        logError("sitemap:videos", error, { requestId: context.requestId });
      }
    }

    const blogPages: SitemapUrl[] = (blogs as ContentPage[])
      .filter((blog) => blog.slug && blog.status === "published")
      .map((blog) =>
        toSitemapPage({
          url: `/blog/${blog.slug}`,
          changefreq: "weekly",
          priority: "0.8",
          lastmod: blog.updatedAt || blog.publishedAt || blog.createdAt,
        }),
      );

    const videoPages: SitemapUrl[] = (videos as ContentPage[])
      .filter((video) => video.slug && video.status === "published")
      .map((video) =>
        toSitemapPage({
          url: `/watch/${video.slug}`,
          changefreq: "weekly",
          priority: "0.8",
          lastmod: video.updatedAt || video.publishedAt || video.createdAt,
        }),
      );

    const staticPages: SitemapUrl[] = getStaticPages().map(toSitemapPage);

    const seen = new Set<string>();
    const allPages: SitemapUrl[] = [...staticPages, ...blogPages, ...videoPages].filter((page) => {
      if (seen.has(page.url)) return false;
      seen.add(page.url);
      return true;
    });

    const xml = generateSitemapXML(BASE_URL, allPages);

    return textResponse(context, xml, {
      status: 200,
      cacheControl: "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
      },
    });
  } catch (error) {
    logError("sitemap:get", error, { requestId: context.requestId });
    const now = new Date().toISOString();
    const fallbackXml = generateSitemapXML(BASE_URL, [
      { url: "/", changefreq: "daily", priority: "1.0", lastmod: now },
      { url: "/about", changefreq: "monthly", priority: "0.8", lastmod: now },
      { url: "/watch", changefreq: "daily", priority: "0.9", lastmod: now },
      { url: "/blog", changefreq: "daily", priority: "0.9", lastmod: now },
    ]);

    return textResponse(context, fallbackXml, {
      status: 200,
      cacheControl: "public, max-age=1800, s-maxage=1800, stale-while-revalidate=3600",
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
      },
    });
  }
}
