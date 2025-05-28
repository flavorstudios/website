import { getBlogPosts, getVideos } from "@/lib/content-store"
import { generateSitemapXML, getStaticPages, type SitemapUrl } from "@/lib/sitemap-utils"

const websiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL

export default async function GET(): Promise<Response> {
  const staticPages: SitemapUrl[] = getStaticPages().map((page) => ({
    url: page,
    changefreq: "daily",
    priority: "0.9",
  }))

  const dynamicPages: SitemapUrl[] = []

  try {
    // Fetch blog posts using content store
    const blogs = await getBlogPosts()
    blogs.forEach((blog) => {
      if (blog.slug && blog.status === "published") {
        dynamicPages.push({
          url: `/blog/${blog.slug}`,
          priority: "0.7",
          changefreq: "weekly",
          lastmod: blog.updatedAt || blog.publishedAt || blog.createdAt,
        })
      }
    })

    // Fetch videos using content store
    const videos = await getVideos()
    videos.forEach((video) => {
      if (video.youtubeId && video.status === "published") {
        dynamicPages.push({
          url: `/watch/${video.youtubeId}`,
          priority: "0.7",
          changefreq: "weekly",
          lastmod: video.updatedAt || video.publishedAt || video.createdAt,
        })
      }
    })
  } catch (error) {
    console.error("Error fetching content for sitemap:", error)
  }

  const allPages: SitemapUrl[] = [...staticPages, ...dynamicPages]

  const sitemap = generateSitemapXML(allPages, websiteUrl)

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml",
    },
  })
}
