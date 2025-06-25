import { getMetadata } from "@/lib/seo-utils";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import LegalPageClient from "./LegalPageClient";

// === SEO METADATA (REQUIRED FOR NEXT.JS 15+) ===
export const metadata = getMetadata({
  title: `${SITE_NAME} | Legal Policies, Privacy & Terms`,
  description:
    `Access all ${SITE_NAME} legal documents: Privacy Policy, DMCA, Terms of Service, and more. Stay informed and protected with our up-to-date policies.`,
  path: "/legal",
  robots: "index,follow", // Explicitly index the /legal overview page
  openGraph: {
    title: `${SITE_NAME} | Legal Policies, Privacy & Terms`,
    description:
      `Access all ${SITE_NAME} legal documents: Privacy Policy, DMCA, Terms of Service, and more. Stay informed and protected with our up-to-date policies.`,
    type: "website",
    images: [
      {
        url: `${SITE_URL}/cover.jpg`,
        width: 1200,
        height: 630,
      },
    ],
    // url and site_name omitted; helper will fill!
  },
  twitter: {
    card: "summary_large_image",
    site: "@flavorstudios",
    creator: "@flavorstudios",
    title: `${SITE_NAME} | Legal Policies, Privacy & Terms`,
    description:
      `Access all ${SITE_NAME} legal documents: Privacy Policy, DMCA, Terms of Service, and more. Stay informed and protected with our up-to-date policies.`,
    images: [`${SITE_URL}/cover.jpg`],
  },
  // JSON-LD/schema REMOVED; now in head.tsx only
})

export default function LegalPage() {
  return <LegalPageClient />
}
