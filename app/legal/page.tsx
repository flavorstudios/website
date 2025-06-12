import { getMetadata } from "@/lib/seo-utils"
import LegalPageClient from "./LegalPageClient"

// === SEO METADATA (REQUIRED FOR NEXT.JS 15+) ===
export const metadata = getMetadata({
  title: "Flavor Studios | Legal Policies, Privacy & Terms",
  description:
    "Access all Flavor Studios legal documents: Privacy Policy, DMCA, Terms of Service, and more. Stay informed and protected with our up-to-date policies.",
  path: "/legal",
  robots: "index,follow", // Explicitly index the /legal overview page
  openGraph: {
    title: "Flavor Studios | Legal Policies, Privacy & Terms",
    description:
      "Access all Flavor Studios legal documents: Privacy Policy, DMCA, Terms of Service, and more. Stay informed and protected with our up-to-date policies.",
    url: "https://flavorstudios.in/legal",
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
    title: "Flavor Studios | Legal Policies, Privacy & Terms",
    description:
      "Access all Flavor Studios legal documents: Privacy Policy, DMCA, Terms of Service, and more. Stay informed and protected with our up-to-date policies.",
    images: ["https://flavorstudios.in/cover.jpg"],
  },
  schema: {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Legal Policies, Privacy & Terms – Flavor Studios",
    description:
      "Access all Flavor Studios legal documents: Privacy Policy, DMCA, Terms of Service, and more. Stay informed and protected with our up-to-date policies.",
    url: "https://flavorstudios.in/legal",
    publisher: {
      "@type": "Organization",
      name: "Flavor Studios",
      url: "https://flavorstudios.in",
      logo: {
        "@type": "ImageObject",
        url: "https://flavorstudios.in/logo.png",
      },
      sameAs: [
        "https://www.youtube.com/@flavorstudios",
        "https://www.instagram.com/flavorstudios",
        "https://twitter.com/flavor_studios",
        "https://www.facebook.com/flavourstudios",
        "https://www.threads.net/@flavorstudios",
        "https://discord.com/channels/@flavorstudios",
        "https://t.me/flavorstudios",
        "https://www.reddit.com/r/flavorstudios/",
        "https://bsky.app/profile/flavorstudios.bsky.social",
      ],
    },
  },
})

export default function LegalPage() {
  return <LegalPageClient />
}
