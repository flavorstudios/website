export interface BlogPostSchema {
  title: string
  excerpt: string
  author: string
  publishedAt: string
  slug: string
  featuredImage?: string
}

export interface VideoSchema {
  title: string
  description: string
  thumbnail?: string
  publishedAt: string
  slug: string
  youtubeId?: string
}

export interface FAQSchema {
  question: string
  answer: string
}

export function generateWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Flavor Studios",
    url: "https://flavorstudios.in",
    description:
      "Independent animation studio specializing in emotionally resonant 3D animated content and original anime series.",
    publisher: {
      "@type": "Organization",
      name: "Flavor Studios",
      url: "https://flavorstudios.in",
    },
  }
}

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Flavor Studios",
    url: "https://flavorstudios.in",
    description:
      "Independent animation studio specializing in emotionally resonant 3D animated content and original anime series.",
    contactPoint: {
      "@type": "ContactPoint",
      email: "contact@flavorstudios.in",
      contactType: "customer service",
    },
    sameAs: [
      "https://www.youtube.com/@flavorstudios",
      "https://www.instagram.com/flavorstudios",
      "https://twitter.com/flavor_studios",
    ],
  }
}

export function generateBlogPostSchema(post: BlogPostSchema) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    author: {
      "@type": "Organization",
      name: "Flavor Studios",
    },
    publisher: {
      "@type": "Organization",
      name: "Flavor Studios",
      url: "https://flavorstudios.in",
    },
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    url: `https://flavorstudios.in/blog/${post.slug}`,
    image: post.featuredImage || "https://flavorstudios.in/og-image.jpg",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://flavorstudios.in/blog/${post.slug}`,
    },
  }
}

export function generateVideoSchema(video: VideoSchema) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: video.title,
    description: video.description,
    thumbnailUrl: video.thumbnail || "https://flavorstudios.in/og-image.jpg",
    uploadDate: video.publishedAt,
    contentUrl: video.youtubeId ? `https://www.youtube.com/watch?v=${video.youtubeId}` : undefined,
    embedUrl: video.youtubeId ? `https://www.youtube.com/embed/${video.youtubeId}` : undefined,
    publisher: {
      "@type": "Organization",
      name: "Flavor Studios",
      url: "https://flavorstudios.in",
    },
  }
}

export function generateFAQSchema(faqs: FAQSchema[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  }
}

export function generateContactPageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": "https://flavorstudios.in/contact",
    },
    description: "Contact Flavor Studios for inquiries, collaborations, and support",
    provider: {
      "@type": "Organization",
      name: "Flavor Studios",
      url: "https://flavorstudios.in",
    },
  }
}

export function generateAboutPageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": "https://flavorstudios.in/about",
    },
    description:
      "Learn about Flavor Studios - an independent animation studio specializing in emotionally resonant content",
    about: {
      "@type": "Organization",
      name: "Flavor Studios",
      description:
        "Independent animation studio specializing in emotionally resonant 3D animated content and original anime series",
    },
  }
}
