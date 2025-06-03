import { getMetadata } from "@/lib/seo-utils"

export const metadata = getMetadata({
  title: "Contact Us | Flavor Studios",
  description: "Connect with Flavor Studios for collaborations, support, business inquiries, or feedback. Reach out to our team—your voice matters.",
  path: "/contact",
  openGraph: {
    images: ["https://flavorstudios.in/og-image.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@flavorstudios",
    image: "https://flavorstudios.in/og-image.png",
  },
  schema: {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contact Us",
    "description": "Contact Flavor Studios for collaboration, support, feedback, or business inquiries.",
    "url": "https://flavorstudios.in/contact",
    "publisher": {
      "@type": "Organization",
      "name": "Flavor Studios",
      "url": "https://flavorstudios.in"
    },
    "datePublished": "2025-05-09",
    "dateModified": "2025-05-09"
  },
  robots: "index, follow"
});
