import type { Metadata } from "next"
import BlogPostClient from "./BlogPostClient"

// This is a sample function to get blog post data
// In a real app, you would fetch this from an API or database
async function getBlogPost(slug: string) {
  // Mock blog post data
  const blogPosts = [
    {
      id: 1,
      slug: "character-design-art",
      title: "The Art of Character Design: Creating Memorable Anime Characters",
      summary: "Explore the principles and techniques behind creating anime characters that resonate with audiences.",
      image: "/placeholder.svg?height=600&width=1200&text=Character+Design",
    },
    {
      id: 2,
      slug: "storyboard-to-screen",
      title: "From Storyboard to Screen: The Animation Process Explained",
      summary: "A behind-the-scenes look at how we bring our stories to life through animation.",
      image: "/placeholder.svg?height=600&width=1200&text=Animation+Process",
    },
    {
      id: 3,
      slug: "anime-evolution",
      title: "The Evolution of Anime: Past, Present, and Future Trends",
      summary: "Examining how anime has evolved over the decades and where it might be heading next.",
      image: "/placeholder.svg?height=600&width=1200&text=Anime+Evolution",
    },
  ]

  return blogPosts.find((post) => post.slug === slug) || null
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getBlogPost(params.slug)

  if (!post) {
    return {
      title: "Post Not Found | Flavor Studios",
      description: "The blog post you're looking for doesn't exist or has been moved.",
    }
  }

  return {
    title: `${post.title} | Flavor Studios`,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      images: [post.image || "/og-image.jpg"],
    },
  }
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  return <BlogPostClient slug={params.slug} />
}
