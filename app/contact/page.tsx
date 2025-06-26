// app/contact/page.tsx

import { getMetadata, getSchema } from "@/lib/seo-utils";
import { SITE_NAME, SITE_URL, SITE_BRAND_TWITTER, SITE_LOGO_URL } from "@/lib/constants";
import { StructuredData } from "@/components/StructuredData"; // Assumes you have this for JSON-LD
import ContactPageClient from "./ContactPageClient";

// --- SEO Metadata using centralized handler ---
export const metadata = getMetadata({
  title: `Contact ${SITE_NAME} – Collaborate or Inquire`,
  description:
    `Have a question or proposal? Contact ${SITE_NAME} for support, collaborations, or general inquiries. We respond within 24–48 hours.`,
  path: "/contact", // The path for this page, used by getMetadata to construct canonical URL
  robots: "index,follow",
  openGraph: {
    title: `Contact ${SITE_NAME} – Collaborate or Inquire`,
    description:
      `Have a question or proposal? Contact ${SITE_NAME} for support, collaborations, or general inquiries. We respond within 24–48 hours.`,
    type: "website",
    images: [
      {
        url: `${SITE_URL}/cover.jpg`,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} Cover`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: SITE_BRAND_TWITTER,
    creator: SITE_BRAND_TWITTER,
    title: `Contact ${SITE_NAME} – Collaborate or Inquire`,
    description:
      `Have a question or proposal? Contact ${SITE_NAME} for support, collaborations, or general inquiries. We respond within 24–48 hours.`,
    images: [`${SITE_URL}/cover.jpg`],
  },
});

// --- Main Server Component for the Contact page ---
export default function ContactPage() {
  // Generate WebPage schema for enhanced SEO (JSON-LD)
  const schema = getSchema({
    type: "WebPage",
    path: "/contact", // getSchema will use this path to construct the URL
    title: `Contact ${SITE_NAME} – Collaborate or Inquire`,
    description:
      `Have a question or proposal? Contact ${SITE_NAME} for support, collaborations, or general inquiries. We respond within 24–48 hours.`,
    image: `${SITE_URL}/cover.jpg`,
    // 'url' property removed as getSchema constructs it from 'path'
    publisher: {
      name: SITE_NAME,
      logo: SITE_LOGO_URL,
    },
  });

  return (
    <>
      {/* Inject WebPage JSON-LD structured data for SEO */}
      <StructuredData schema={schema} />
      {/* The main interactive content of the contact page, likely a Client Component */}
      <ContactPageClient />
    </>
  );
}
