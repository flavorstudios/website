import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, ArrowLeft, Eye } from "lucide-react"

async function getBlogPost(slug: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || ""
    const res = await fetch(`${baseUrl}/api/admin/blogs`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    })

    if (!res.ok) throw new Error("Failed to fetch")

    const data = await res.json()
    const post = data.posts?.find((p: any) => p.slug === slug && p.status === "published")

    return post
  } catch (error) {
    // Return sample post for development
    const samplePosts: any = {
      "new-anime-season-preview": {
        id: 1,
        title: "New Anime Season Preview: What to Watch This Fall",
        content: `
# New Anime Season Preview: What to Watch This Fall

The fall anime season is upon us, and it's packed with exciting new releases and highly anticipated continuations. Here's our comprehensive guide to the must-watch anime this season.

## Top Picks for Fall 2024

### 1. Mystic Chronicles
Our very own original series continues with its second season. Follow the adventures of Akira as he navigates the mystical world of ancient spirits and modern technology.

### 2. Dragon Academy Returns
The beloved series returns with a new arc focusing on the advanced students and their final trials.

### 3. Cyber Samurai 2099
A cyberpunk masterpiece that blends traditional samurai culture with futuristic technology.

## What Makes This Season Special

This fall season stands out for its diverse range of genres and high production values. From slice-of-life comedies to epic fantasy adventures, there's something for every anime fan.

## Our Recommendations

Based on our preview screenings and industry insights, we highly recommend keeping an eye on these upcoming releases. Each brings something unique to the table and promises to deliver memorable storytelling experiences.

Stay tuned to Flavor Studios for more in-depth reviews and episode discussions as the season progresses!
        `,
        excerpt: "Discover the most anticipated anime releases coming this season...",
        publishedAt: "2024-01-15",
        category: "News",
        slug: "new-anime-season-preview",
        coverImage: "/placeholder.svg?height=400&width=800&query=anime season preview",
        author: "Flavor Studios Team",
        views: 15420,
        status: "published",
      },
      "behind-the-scenes-latest-series": {
        id: 2,
        title: "Behind the Scenes: Creating Our Latest Original Series",
        content: `
# Behind the Scenes: Creating Our Latest Original Series

Take an exclusive look into the creative process behind our newest original anime series, "Mystic Chronicles."

## The Creative Journey

Creating an original anime series is a labor of love that requires months of planning, designing, and storytelling. Our team has been working tirelessly to bring this vision to life.

### Character Development
Each character in Mystic Chronicles was carefully crafted with unique backstories, motivations, and growth arcs. We spent countless hours developing their personalities and relationships.

### World Building
The mystical world of our series required extensive research into mythology, folklore, and spiritual traditions from various cultures.

### Animation Process
Our animation team uses a blend of traditional 2D techniques and modern digital tools to create the distinctive visual style of the series.

## Challenges and Solutions

Every creative project comes with its challenges. Here's how we overcame some of the major obstacles during production.

## What's Next

We're excited to share more behind-the-scenes content as we continue working on future episodes. Stay tuned for character design reveals and animation process videos!
        `,
        excerpt: "Take a look at our creative process and the making of our newest project...",
        publishedAt: "2024-01-12",
        category: "Studio Updates",
        slug: "behind-the-scenes-latest-series",
        coverImage: "/placeholder.svg?height=400&width=800&query=anime production behind scenes",
        author: "Director Team",
        views: 8930,
        status: "published",
      },
      "top-underrated-anime": {
        id: 3,
        title: "Top 10 Underrated Anime You Should Watch",
        content: `
# Top 10 Underrated Anime You Should Watch

The anime world is vast, and sometimes the best series get overlooked. Here are our top picks for underrated anime that deserve more recognition.

## 1. Silent Moon Academy
A beautiful slice-of-life series about students at a prestigious art school.

## 2. The Clockwork Detective
A steampunk mystery series with incredible attention to detail.

## 3. Harmony of Elements
A fantasy series that explores the balance between nature and magic.

## 4. Midnight Café Chronicles
A supernatural series set in a café that appears only at midnight.

## 5. The Paper Airplane Club
A heartwarming story about friendship and dreams.

## 6. Neon Nights
A cyberpunk thriller with stunning visuals.

## 7. The Garden of Whispers
A psychological drama with beautiful symbolism.

## 8. Starlight Express
A space opera with compelling characters.

## 9. The Melody Makers
A music-focused series about a high school band.

## 10. Ancient Guardians
A historical fantasy with rich world-building.

Each of these series offers something unique and deserves a place in any anime fan's watchlist.
        `,
        excerpt: "Hidden gems that deserve more recognition in the anime community...",
        publishedAt: "2024-01-10",
        category: "Reviews",
        slug: "top-underrated-anime",
        coverImage: "/placeholder.svg?height=400&width=800&query=underrated anime collection",
        author: "Review Team",
        views: 12750,
        status: "published",
      },
    }

    return samplePosts[slug] || null
  }
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getBlogPost(params.slug)

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button asChild variant="ghost" className="mb-6">
          <Link href="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Link>
        </Button>

        {/* Article Header */}
        <article className="bg-white rounded-lg shadow-sm overflow-hidden">
          {post.coverImage && (
            <div className="h-64 md:h-96 overflow-hidden">
              <img
                src={post.coverImage || "/placeholder.svg"}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-6 md:p-8">
            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <Badge variant="outline">{post.category}</Badge>
              <div className="flex items-center text-gray-500 text-sm">
                <Calendar className="mr-1 h-4 w-4" />
                {new Date(post.publishedAt).toLocaleDateString()}
              </div>
              <div className="flex items-center text-gray-500 text-sm">
                <Eye className="mr-1 h-4 w-4" />
                {post.views?.toLocaleString() || "0"} views
              </div>
              {post.author && <div className="text-gray-500 text-sm">By {post.author}</div>}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">{post.title}</h1>

            {/* Content */}
            <div className="prose prose-lg max-w-none">
              {post.content.split("\n").map((paragraph: string, index: number) => {
                if (paragraph.startsWith("# ")) {
                  return (
                    <h1 key={index} className="text-2xl font-bold mt-8 mb-4">
                      {paragraph.replace("# ", "")}
                    </h1>
                  )
                }
                if (paragraph.startsWith("## ")) {
                  return (
                    <h2 key={index} className="text-xl font-semibold mt-6 mb-3">
                      {paragraph.replace("## ", "")}
                    </h2>
                  )
                }
                if (paragraph.startsWith("### ")) {
                  return (
                    <h3 key={index} className="text-lg font-medium mt-4 mb-2">
                      {paragraph.replace("### ", "")}
                    </h3>
                  )
                }
                if (paragraph.trim() === "") {
                  return <br key={index} />
                }
                return (
                  <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                    {paragraph}
                  </p>
                )
              })}
            </div>
          </div>
        </article>

        {/* Related Posts */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">More Articles</h2>
          <div className="text-center">
            <Button asChild>
              <Link href="/blog">View All Blog Posts</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
