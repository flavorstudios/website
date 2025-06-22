// app/blog/sitemap.xml/route.ts

import { NextResponse } from "next/server";
import { blogStore } from "@/lib/content-store";
import { generateSitemapXML } from "@/lib/sitemap-utils";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || "https://flavorstudios.in";

interface ContentPage {
  slug: string;
  updatedAt?: string;
  publishedAt?: string;
  createdAt?: string;
}

export async function GET() {
  try {
    const blogs = await blogStore.getPublished();

    // Always include /blog root page
    const blogPages: {
      url: string;
      changefreq: "weekly";
      priority: string;
      lastmod?: string;
    }[] = [
      {
        url: "/blog",
        changefreq: "weekly",
        priority: "0.5",
        lastmod: new Date().toISOString(),
      },
    ];

    // Add published blogs if available
    if (Array.isArray(blogs) && blogs.length > 0) {
      for (const blog of blogs as ContentPage[]) {
        if (blog.slug && blog.slug !== "blog") {
          blogPages.push({
            url: `/blog/${blog.slug}`,
            changefreq: "weekly",
            priority: "0.8",
            lastmod: blog.updatedAt || blog.publishedAt || blog.createdAt,
          });
        }
      }
    }

    const xml = generateSitemapXML(BASE_URL, blogPages);

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    // Log error server-side for debugging
    console.error("Blog sitemap generation failed:", error);
    // Fallback: minimal, valid sitemap with only /blog
    const xml = generateSitemapXML(BASE_URL, [
      {
        url: "/blog",
        changefreq: "weekly",
        priority: "0.5",
        lastmod: new Date().toISOString(),
      },
    ]);
    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=1800, s-maxage=1800",
      },
    });
  }
}