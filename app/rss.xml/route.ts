import { generateRssFeed } from "@/lib/rss-utils"

export async function GET(): Promise<Response> {
  try {
    const rssXml = await generateRssFeed()

    return new Response(rssXml, {
      headers: {
        "Content-Type": "application/rss+xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    })
  } catch (error) {
    console.error("Error serving RSS feed:", error)
    return new Response("Error generating RSS feed", { status: 500 })
  }
}
