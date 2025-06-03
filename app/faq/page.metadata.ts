import { getMetadata } from "@/lib/seo-utils"

export const metadata = getMetadata({
  title: "FAQ | Flavor Studios",
  description: "Get answers to the most frequently asked questions about Flavor Studios—covering content, support, donations, legal info, and more.",
  path: "/faq",
  openGraph: {
    images: ["https://flavorstudios.in/og-image.png"],
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    site: "@flavorstudios",
    image: "https://flavorstudios.in/og-image.png"
  },
  robots: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1",
  schema: {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      // Include up to 10-12 of your best questions for rich snippets. Example:
      {
        "@type": "Question",
        "name": "What is Flavor Studios?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Flavor Studios is a creative studio focused on producing high-quality anime-inspired content. We craft original videos, blog posts, and interactive experiences designed for anime fans across the globe."
        }
      },
      {
        "@type": "Question",
        "name": "How can I support Flavor Studios?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "You can support us by subscribing to our YouTube channel, sharing our content, or donating through our Buy Me a Coffee page."
        }
      },
      {
        "@type": "Question",
        "name": "How often do you release new content?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Blog posts go up 2 to 3 times per week. Animated videos are released weekly, though timelines may vary during larger productions."
        }
      },
      // ...Add more FAQ objects for your top 10-12 real questions/answers
    ]
  },
  alternates: {
    canonical: "https://flavorstudios.in/faq",
  },
})
