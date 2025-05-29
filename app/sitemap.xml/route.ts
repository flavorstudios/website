import { blogStore, videoStore } from "@/lib/content-store"
import { categoryStore } from "@/lib/category-store"

export async function GET(): Promise<Response> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

  try {
    // Fetch all published content
    const [blogs, videos, categories] = await Promise.all([
      blogStore.getPublished(),
      videoStore.getPublished(),
      categoryStore.getAll(),
    ])

    // Static routes
    const staticRoutes = [
      { url: `${baseUrl}/`, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
      { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
      { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
      { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
      { url: `${baseUrl}/watch`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
      { url: `${baseUrl}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/play`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/support`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/career`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/legal`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
      { url: `${baseUrl}/terms-of-service`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
      { url: `${baseUrl}/privacy-policy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
      { url: `${baseUrl}/cookie-policy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
      { url: `${baseUrl}/disclaimer`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
      { url: `${baseUrl}/dmca`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
      { url: `${baseUrl}/media-usage-policy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    ]

    // Blog routes
    const blogRoutes = blogs.map((blog) => ({
      url: `${baseUrl}/blog/${blog.slug}`,
      lastModified: new Date(blog.updatedAt || blog.publishedAt),
      changeFrequency: "weekly",
      priority: 0.8,
    }))

    // Video routes
    const videoRoutes = videos.map((video) => ({
      url: `${baseUrl}/watch/${video.id}`,
      lastModified: new Date(video.updatedAt || video.publishedAt),
      changeFrequency: "weekly",
      priority: 0.8,
    }))

    // Category routes
    const categoryRoutes = categories.flatMap((category) => {
      const slug = category.slug || category.name.toLowerCase().replace(/\s+/g, "-")
      return [
        {
          url: `${baseUrl}/blog?category=${slug}`,
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: 0.7,
        },
        {
          url: `${baseUrl}/watch?category=${slug}`,
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: 0.7,
        },
      ]
    })

    // Combine all routes
    const allRoutes = [...staticRoutes, ...blogRoutes, ...videoRoutes, ...categoryRoutes]

    // Generate XML
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes
  .map(
    (route) => `
  <url>
    <loc>${route.url}</loc>
    <lastmod>${route.lastModified.toISOString()}</lastmod>
    <changefreq>${route.changeFrequency}</changefreq>
    <priority>${route.priority}</priority>
  </url>
`,
  )
  .join("")}
</urlset>`

    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    })
  } catch (error) {
    console.error("Error generating sitemap:", error)

    // Return a basic sitemap with just the main pages if there's an error
    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/blog</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/watch</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`

    return new Response(fallbackXml, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    })
  }
}
