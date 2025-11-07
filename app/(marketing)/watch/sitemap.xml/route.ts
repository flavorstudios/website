import { NextRequest } from "next/server";
import { generateSitemapXML, SitemapUrl } from "@/lib/sitemap-utils";
import { serverEnv } from "@/env/server";
import { canonicalBaseUrl } from "@/lib/base-url";
import { createRequestContext, textResponse } from "@/lib/api/response";
import { logError } from "@/lib/log";

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
  const skipFetch =
    serverEnv.NODE_ENV === "test" ||
    serverEnv.TEST_MODE === "true" ||
    process.env.TEST_MODE === "true";

  try {
    let videos: ContentPage[] = [];
    if (!skipFetch) {
      try {
        const res = await fetch(`${BASE_URL}/api/videos`, { cache: "no-store" });
        if (res.ok) {
          videos = await res.json();
        }
      } catch (error) {
        logError("watch-sitemap:videos", error, { requestId: context.requestId });
      }
    }

    const videoPages: SitemapUrl[] = [
      toSitemapPage({
        url: "/watch",
        changefreq: "weekly",
        priority: "0.5",
        lastmod: new Date().toISOString(),
      }),
    ];

    if (Array.isArray(videos)) {
      for (const video of videos) {
        if (
          video.slug &&
          video.slug !== "watch" &&
          (!video.status || video.status === "published")
        ) {
          videoPages.push(
            toSitemapPage({
              url: `/watch/${video.slug}`,
              changefreq: "weekly",
              priority: "0.8",
              lastmod: video.updatedAt || video.publishedAt || video.createdAt,
            }),
          );
        }
      }
    }

    const xml = generateSitemapXML(BASE_URL, videoPages);
    return textResponse(context, xml, {
      status: 200,
      cacheControl: "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
      },
    });
  } catch (error) {
    logError("watch-sitemap:get", error, { requestId: context.requestId });
    const now = new Date().toISOString();
    const fallbackXml = generateSitemapXML(BASE_URL, [
      { url: "/watch", changefreq: "weekly", priority: "0.5", lastmod: now },
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
