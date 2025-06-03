import { blogStore } from "@/lib/blogStore" // or your correct path

export async function generateMetadata({ params }) {
  const post = await blogStore.getPostBySlug(params.slug)

  // Fallback for missing post
  if (!post) {
    const fallbackUrl = `https://flavorstudios.in/blog/${params.slug}`
    return {
      title: "Post Not Found – Flavor Studios",
      description: "This blog post could not be found.",
      alternates: { canonical: fallbackUrl },
      openGraph: {
        title: "Post Not Found",
        description: "This blog post could not be found.",
        url: fallbackUrl,
        type: "article",
        images: [
          {
            url: "https://flavorstudios.in/cover.jpg",
            width: 1200,
            height: 630,
            alt: "Flavor Studios Cover",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        site: "@flavor_studios",
        title: "Post Not Found – Flavor Studios",
        description: "This blog post could not be found.",
        images: ["https://flavorstudios.in/cover.jpg"],
      },
      robots: "noindex, nofollow",
    }
  }

  // Gather post data
  const canonicalUrl = `https://flavorstudios.in/blog/${post.slug}`
  const ogImage = post.imageUrl || "https://flavorstudios.in/cover.jpg"
  const seoTitle = post.title
  const seoDescription = post.excerpt || "Discover powerful stories and animation at Flavor Studios."
  const publishedTime = post.publishedAt || new Date().toISOString()
  const updatedTime = post.updatedAt || publishedTime
  const tags = post.tags || []
  const category = post.category || "Blog"
  const robots = post.draft ? "noindex, nofollow" : "index, follow"

  // JSON-LD Structured Data for Article
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    "headline": seoTitle,
    "description": seoDescription,
    "image": [ogImage],
    "author": {
      "@type": "Organization",
      "name": "Flavor Studios",
      "url": "https://flavorstudios.in",
    },
    "publisher": {
      "@type": "Organization",
      "name": "Flavor Studios",
      "logo": {
        "@type": "ImageObject",
        "url": "https://flavorstudios.in/favicon-512.png",
      },
    },
    "datePublished": publishedTime,
    "dateModified": updatedTime,
    "articleSection": category,
    "keywords": tags.join(", "),
  }

  return {
    title: `${seoTitle} – Flavor Studios`,
    description: seoDescription,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      url: canonicalUrl,
      type: "article",
      siteName: "Flavor Studios",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: seoTitle,
        },
      ],
      publishedTime,
      modifiedTime: updatedTime,
      section: category,
      tags,
    },
    twitter: {
      card: "summary_large_image",
      site: "@flavor_studios",
      title: seoTitle,
      description: seoDescription,
      images: [ogImage],
    },
    robots,
    // JSON-LD for manual injection (see earlier responses for how to inject)
    other: {
      "schema:jsonld": JSON.stringify(jsonLd),
    },
  }
}
