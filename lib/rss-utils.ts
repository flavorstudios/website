import { blogStore, videoStore } from "./content-store"

export async function generateRssFeed() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

  try {
    // Fetch all published content
    const [blogs, videos] = await Promise.all([blogStore.getPublished(), videoStore.getPublished()])

    // Sort all content by date, newest first
    const allContent = [
      ...blogs.map((blog) => ({
        type: "blog",
        title: blog.title,
        description: blog.excerpt,
        url: `${baseUrl}/blog/${blog.slug}`,
        date: new Date(blog.publishedAt),
        author: blog.author,
        category: blog.category,
      })),
      ...videos.map((video) => ({
        type: "video",
        title: video.title,
        description: video.description,
        url: `${baseUrl}/watch/${video.id}`,
        date: new Date(video.publishedAt),
        author: "Flavor Studios",
        category: video.category,
      })),
    ].sort((a, b) => b.date.getTime() - a.date.getTime())

    // Take only the most recent 50 items
    const recentContent = allContent.slice(0, 50)

    // Generate RSS XML
    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:wfw="http://wellformedweb.org/CommentAPI/"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:sy="http://purl.org/rss/1.0/modules/syndication/"
  xmlns:slash="http://purl.org/rss/1.0/modules/slash/"
>
  <channel>
    <title>Flavor Studios</title>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
    <link>${baseUrl}</link>
    <description>Original anime content and behind-the-scenes insights from Flavor Studios</description>
    <language>en-US</language>
    <pubDate>${new Date().toUTCString()}</pubDate>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <generator>Flavor Studios RSS Generator</generator>
    <sy:updatePeriod>hourly</sy:updatePeriod>
    <sy:updateFrequency>1</sy:updateFrequency>
    <image>
      <url>${baseUrl}/favicon.ico</url>
      <title>Flavor Studios</title>
      <link>${baseUrl}</link>
    </image>
    ${recentContent
      .map(
        (item) => `
    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${item.url}</link>
      <pubDate>${item.date.toUTCString()}</pubDate>
      <dc:creator><![CDATA[${item.author}]]></dc:creator>
      <category><![CDATA[${item.category}]]></category>
      <guid isPermaLink="false">${item.url}</guid>
      <description><![CDATA[${item.description}]]></description>
      <content:encoded><![CDATA[${item.description}]]></content:encoded>
    </item>
    `,
      )
      .join("")}
  </channel>
</rss>`

    return rssXml
  } catch (error) {
    console.error("Error generating RSS feed:", error)

    // Return a basic RSS feed if there's an error
    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Flavor Studios</title>
    <link>${baseUrl}</link>
    <description>Original anime content and behind-the-scenes insights from Flavor Studios</description>
    <language>en-US</language>
    <pubDate>${new Date().toUTCString()}</pubDate>
    <item>
      <title>Welcome to Flavor Studios</title>
      <link>${baseUrl}</link>
      <description>Check back soon for new content!</description>
      <pubDate>${new Date().toUTCString()}</pubDate>
    </item>
  </channel>
</rss>`
  }
}

// Helper function to escape XML special characters
function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;"
      case ">":
        return "&gt;"
      case "&":
        return "&amp;"
      case "'":
        return "&apos;"
      case '"':
        return "&quot;"
      default:
        return c
    }
  })
}
