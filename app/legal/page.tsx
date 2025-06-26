// app/legal/page.tsx

import { getMetadata, getSchema } from "@/lib/seo-utils";
import { SITE_NAME, SITE_URL, SITE_LOGO_URL, SITE_BRAND_TWITTER } from "@/lib/constants";
import { StructuredData } from "@/components/StructuredData";
import LegalPageClient from "./LegalPageClient";

// === SEO METADATA (using centralized handler) ===
export const metadata = getMetadata({
  title: `${SITE_NAME} | Legal Policies, Privacy & Terms`,
  description:
    `Access all ${SITE_NAME} legal documents: Privacy Policy, DMCA, Terms of Service, and more. Stay informed and protected with our up-to-date policies.`,
  path: "/legal",
  robots: "index,follow",
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
  },
  twitter: {
    card: "summary_large_image",
    site: SITE_BRAND_TWITTER,
    creator: SITE_BRAND_TWITTER,
    title: `${SITE_NAME} | Legal Policies, Privacy & Terms`,
    description:
      `Access all ${SITE_NAME} legal documents: Privacy Policy, DMCA, Terms of Service, and more. Stay informed and protected with our up-to-date policies.`,
    images: [`${SITE_URL}/cover.jpg`],
  },
});

// === JSON-LD WebPage Schema ===
const schema = getSchema({
  type: "WebPage",
  path: "/legal",
  title: `${SITE_NAME} | Legal Policies, Privacy & Terms`,
  description: `Access all ${SITE_NAME} legal documents: Privacy Policy, DMCA, Terms of Service, and more. Stay informed and protected with our up-to-date policies.`,
  image: SITE_LOGO_URL,
  publisher: {
    name: SITE_NAME,
    logo: SITE_LOGO_URL,
  },
});

export default function LegalPage() {
  return (
    <>
      {/* JSON-LD WebPage Schema for SEO */}
      <StructuredData schema={schema} />
      <LegalPageClient />
    </>
  );
}
