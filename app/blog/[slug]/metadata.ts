import type { Metadata } from "next"
import { getPostData } from "@/lib/posts"

interface BlogPostPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = await getPostData(params.slug)

  const summary = post.summary || post.excerpt || "A new perspective from the world of Flavor Studios."
  const coverImage = post.image
    ? `/abstract-geometric-shapes.png?key=uce0t&key=1heqp&height=720&width=1280&query=${post.image}`
    : "https://flavorstudios.in/og-image.jpg"
  const publishedAt = post.date || new Date().toISOString()
  const updatedAt = post.updatedAt || publishedAt
  const authorName = post.author || "Flavor Studios Team"

  return {
    title: `${post.title} – Flavor Studios Blog`,
    description: summary,
    openGraph: {
      title: post.title,
      description: summary,
      url: `https://flavorstudios.in/blog/${params.slug}`,
      type: "article",
      publishedTime: publishedAt,
      authors: [authorName],
      images: [
        {
          url: coverImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: summary,
      images: [coverImage],
    },
    other: {
      "application/ld+json": JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        description: summary,
        image: coverImage,
        author: {
          "@type": "Organization",
          name: "Flavor Studios",
          url: "https://flavorstudios.in",
        },
        publisher: {
          "@type": "Organization",
          name: "Flavor Studios",
          logo: {
            "@type": "ImageObject",
            url: "https://flavorstudios.in/logo.png",
          },
        },
        datePublished: publishedAt,
        dateModified: updatedAt,
        mainEntityOfPage: `https://flavorstudios.in/blog/${params.slug}`,
      }),
    },
  }
}
