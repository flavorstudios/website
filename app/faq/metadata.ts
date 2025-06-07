import { getMetadata } from "@/lib/seo-utils"

const metadata = getMetadata({
  title: "Frequently Asked Questions – Flavor Studios",
  description: "Find answers to common questions about Flavor Studios, animation, support, and our creative process. Get the info you need to enjoy our content and community.",
  path: "/faq",
  openGraph: {
    images: ["https://flavorstudios.in/og-faq.png"], // Change if you have a custom OG image for FAQ
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@flavorstudios",
    creator: "@flavorstudios",
    image: "https://flavorstudios.in/og-faq.png",
  },
  schema: {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "name": "Flavor Studios FAQ",
    "mainEntity": [
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
          "text": "You can support us by subscribing to our YouTube channel, sharing our content, or donating through our Buy Me a Coffee page: https://buymeacoffee.com/flavorstudios"
        }
      },
      {
        "@type": "Question",
        "name": "How often do you release new content?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Blog posts go up 2 to 3 times per week. Animated videos are released weekly, though timelines may vary during larger productions."
        }
      }
    ]
  }
})

export default metadata
