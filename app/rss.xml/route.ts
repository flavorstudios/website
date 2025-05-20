import { getAllPostSlugs, getPostData } from "@/lib/posts"

export async function GET() {
  // Fetch all post slugs
  const slugs = await getAllPostSlugs()

  // Fetch data for each post
  const posts = await Promise.all(
    slugs.map(async (slug) => {
      const postData = await getPostData(slug)
      return {
        ...postData,
        slug,
      }
    }),
  )

  // Sort posts by date (newest first)
  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Format the RFC822 date for RSS
  const formatRFC822Date = (dateString: string) => {
    const date = new Date(dateString)
    return date.toUTCString()
  }

  // Generate RSS XML
  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Flavor Studios Blog</title>
    <link>https://flavorstudios.in/blog</link>
    <description>Latest blog posts, news, and animation updates from Flavor Studios</description>
    <language>en-us</language>
    <lastBuildDate>${formatRFC822Date(new Date().toISOString())}</lastBuildDate>
    <atom:link href="https://flavorstudios.in/rss.xml" rel="self" type="application/rss+xml" />
    ${posts
      .map(
        (post) => `
    <item>
      <title>${post.title}</title>
      <link>https://flavorstudios.in/blog/${post.slug}</link>
      <description><![CDATA[${post.summary}]]></description>
      <pubDate>${formatRFC822Date(post.date)}</pubDate>
      <guid isPermaLink="true">https://flavorstudios.in/blog/${post.slug}</guid>
      <author>${post.author}</author>
    </item>
    `,
      )
      .join("")}
  </channel>
</rss>`

  // Return the RSS XML with appropriate headers
  return new Response(rssXml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600", // Cache for 1 hour
    },
  })
}
