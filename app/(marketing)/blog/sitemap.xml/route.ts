import { NextRequest } from "next/server";
import { generateSitemapXML, SitemapUrl } from "@/lib/sitemap-utils";
import { serverEnv } from "@/env/server";
import { canonicalBaseUrl } from "@/lib/base-url";
import { createRequestContext, textResponse } from "@/lib/api/response";
import { logError } from "@/lib/log";
import { isTestMode } from "@/config/flags";

const BASE_URL = canonicalBaseUrl();

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

export async function GET(request: NextRequest) {
  const context = createRequestContext(request);
  const skipFetch = serverEnv.NODE_ENV === "test" || isTestMode();

  try {
    let blogs: ContentPage[] = [];
    if (!skipFetch) {
      try {
        const res = await fetch(`${BASE_URL}/api/blogs`, { cache: "no-store" });
        if (res.ok) {
          blogs = await res.json();
        }
      } catch (error) {
        logError("blog-sitemap:blogs", error, { requestId: context.requestId });
      }
    }

    const blogPages: SitemapUrl[] = [
      toSitemapPage({
        url: "/blog",
        changefreq: "weekly",
        priority: "0.6",
        lastmod: new Date().toISOString(),
      }),
    ];

    if (Array.isArray(blogs)) {
      for (const blog of blogs) {
        if (
          blog.slug &&
          (!blog.status || blog.status === "published")
        ) {
          blogPages.push(
            toSitemapPage({
              url: `/blog/${blog.slug}`,
              changefreq: "weekly",
              priority: "0.8",
              lastmod: blog.updatedAt || blog.publishedAt || blog.createdAt,
            }),
          );
        }
      }
    }

    const xml = generateSitemapXML(BASE_URL, blogPages);
    return textResponse(context, xml, {
      status: 200,
      cacheControl: "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
      },
    });
  } catch (error) {
    logError("blog-sitemap:get", error, { requestId: context.requestId });
    const now = new Date().toISOString();
    const fallbackXml = generateSitemapXML(BASE_URL, [
      { url: "/blog", changefreq: "weekly", priority: "0.6", lastmod: now },
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
