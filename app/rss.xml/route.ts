import { NextResponse } from "next/server";
import { generateRssFeed } from "@/lib/rss-utils";

export async function GET() {
  try {
    const rssXml = await generateRssFeed();
    return new NextResponse(rssXml, {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("Error generating RSS feed:", error);
    // Fully DRY: Use the utility's own fallback
    const rssXml = await generateRssFeed(); // Utility will return a valid empty feed if it encounters an error
    return new NextResponse(rssXml, {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, max-age=1800, s-maxage=1800",
      },
    });
  }
}
