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
    site_name: "Flavor Studios", // Always present!
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
  // JSON-LD/schema REMOVED; now in head.tsx only
})

export default function LegalPage() {
  return <LegalPageClient />
}
