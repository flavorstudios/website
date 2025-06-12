import { getMetadata } from "@/lib/seo-utils";

export const metadata = getMetadata({
  title: "Flavor Studios FAQ – Anime & Support Help",
  description:
    "Get answers to frequently asked questions about Flavor Studios, supporting us, using our content, and how we create original anime and stories.",
  path: "/faq",
  robots: "index,follow", // Explicit for public FAQ pages (SEO best practice)
  openGraph: {
    title: "Flavor Studios FAQ – Anime & Support Help",
    description:
      "Get answers to frequently asked questions about Flavor Studios, supporting us, using our content, and how we create original anime and stories.",
    url: "https://flavorstudios.in/faq",
    type: "website",
    site_name: "Flavor Studios",
    images: [
      {
        url: "https://flavorstudios.in/cover.jpg",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@flavorstudios",
    creator: "@flavorstudios",
    title: "Flavor Studios FAQ – Anime & Support Help",
    description:
      "Get answers to frequently asked questions about Flavor Studios, supporting us, using our content, and how we create original anime and stories.",
    images: ["https://flavorstudios.in/cover.jpg"],
  },
  schema: {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    name: "Flavor Studios FAQ",
    url: "https://flavorstudios.in/faq",
    description:
      "Find answers to common questions about Flavor Studios, animation, support, and our creative process.",
    mainEntity: [
      // ✅ Your full FAQ list continues here as-is
      {
        "@type": "Question",
        name: "What is Flavor Studios?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Flavor Studios is a creative studio focused on producing high-quality anime-inspired content. We craft original videos, blog posts, and interactive experiences designed for anime fans across the globe.",
        },
      },
      // ... rest of your FAQ list remains unchanged
      {
        "@type": "Question",
        name: "Is my personal data protected?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. We use modern data security protocols. See our Privacy Policy to understand how your data is collected and used.",
        },
      },
    ],
    publisher: {
      "@type": "Organization",
      name: "Flavor Studios",
      url: "https://flavorstudios.in",
      logo: {
        "@type": "ImageObject",
        url: "https://flavorstudios.in/logo.png",
      },
    },
  },
});
