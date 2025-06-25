import { SITE_NAME, SITE_URL } from "@/lib/constants";
import FaqPageClient from "./FaqPageClient";

export const metadata = {
  title: `${SITE_NAME} FAQ – Anime & Support Help`,
  description: `Get answers to frequently asked questions about ${SITE_NAME}, supporting us, using our content, and how we create original anime and stories.`,
  alternates: {
    canonical: `${SITE_URL}/faq`,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: `${SITE_NAME} FAQ – Anime & Support Help`,
    description: `Get answers to frequently asked questions about ${SITE_NAME}, supporting us, using our content, and how we create original anime and stories.`,
    url: `${SITE_URL}/faq`,
    siteName: SITE_NAME,
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
    site: "@flavorstudios",
    creator: "@flavorstudios",
    title: `${SITE_NAME} FAQ – Anime & Support Help`,
    description: `Get answers to frequently asked questions about ${SITE_NAME}, supporting us, using our content, and how we create original anime and stories.`,
    images: [`${SITE_URL}/cover.jpg`],
  },
};

export default function FAQPage() {
  return <FaqPageClient />;
}
