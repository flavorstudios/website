// app/contact/page.tsx

import { getMetadata, getSchema } from "@/lib/seo-utils";
import { SITE_NAME, SITE_URL, SITE_BRAND_TWITTER } from "@/lib/constants";
import { StructuredData } from "@/components/StructuredData";
import ContactPageClient from "./ContactPageClient";
import { getTranslations } from "next-intl/server";

// --- SEO Metadata using centralized handler, but i18n-enabled ---
export async function generateMetadata() {
  const t = await getTranslations();
  const title = t("metadata.contact.title", { siteName: SITE_NAME });
  const description = t("metadata.contact.description", { siteName: SITE_NAME });
  return getMetadata({
    title,
    description,
    path: "/contact",
    robots: "index,follow",
    openGraph: {
      title,
      description,
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
      title,
      description,
      images: [`${SITE_URL}/cover.jpg`],
    },
  });
}

// --- Main Server Component for the Contact page ---
export default async function ContactPage() {
  const t = await getTranslations();
  // Generate WebPage schema for enhanced SEO (JSON-LD)
  const schema = getSchema({
    type: "WebPage",
    path: "/contact",
    title: t("metadata.contact.title", { siteName: SITE_NAME }),
    description: t("metadata.contact.description", { siteName: SITE_NAME }),
    image: `${SITE_URL}/cover.jpg`,
    // REMOVED: Explicit 'publisher' object. It will now be added automatically by getSchema.
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
