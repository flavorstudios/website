import { SITE_NAME, SITE_URL } from "@/lib/constants"
import ContactPageClient from "./ContactPageClient"

// --- SEO metadata for /contact page (no JSON-LD here, put that in head.tsx) ---
export const metadata = {
  title: `Contact ${SITE_NAME} – Collaborate or Inquire`,
  description:
    `Have a question or proposal? Contact ${SITE_NAME} for support, collaborations, or general inquiries. We respond within 24–48 hours.`,
  alternates: {
    canonical: `${SITE_URL}/contact`,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: `Contact ${SITE_NAME} – Collaborate or Inquire`,
    description:
      `Have a question or proposal? Contact ${SITE_NAME} for support, collaborations, or general inquiries. We respond within 24–48 hours.`,
    type: "website",
    url: `${SITE_URL}/contact`,
    siteName: SITE_NAME,
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
    site: "@flavorstudios",
    creator: "@flavorstudios",
    title: `Contact ${SITE_NAME} – Collaborate or Inquire`,
    description:
      `Have a question or proposal? Contact ${SITE_NAME} for support, collaborations, or general inquiries. We respond within 24–48 hours.`,
    images: [`${SITE_URL}/cover.jpg`],
  },
}

export default function ContactPage() {
  return <ContactPageClient />
}
