import ClientHomePage from "./ClientHomePage"
import { SITE_NAME, SITE_URL, SITE_BRAND_TWITTER } from "@/lib/constants"
import { getMetadata } from "@/lib/seo/metadata"
import { getCanonicalUrl } from "@/lib/seo/canonical"
import { getSchema } from "@/lib/seo/schema"
// --- SEO: Metadata for Home Page ---
export const metadata = getMetadata({
  title: `${SITE_NAME} | Anime News & Original Stories That Inspire`,
  description: `${SITE_NAME} brings you the latest anime news, exclusive updates, and original animated stories crafted with heart. Stay inspired with our creator-driven platform.`,
  path: "/",
  robots: "index,follow",
  openGraph: {
    title: `${SITE_NAME} | Anime News & Original Stories That Inspire`,
    description: `${SITE_NAME} brings you the latest anime news, exclusive updates, and original animated stories crafted with heart. Stay inspired with our creator-driven platform.`,
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
    title: `${SITE_NAME} | Anime News & Original Stories That Inspire`,
    description: `${SITE_NAME} brings you the latest anime news, exclusive updates, and original animated stories crafted with heart. Stay inspired with our creator-driven platform.`,
    images: [`${SITE_URL}/cover.jpg`],
  },
  alternates: {
    canonical: getCanonicalUrl("/"),
  },
})

// --- JSON-LD WebPage Schema ---
const schema = getSchema({
  type: "WebPage",
  path: "/",
  title: `${SITE_NAME} | Anime News & Original Stories That Inspire`,
  description: `${SITE_NAME} brings you the latest anime news, exclusive updates, and original animated stories crafted with heart. Stay inspired with our creator-driven platform.`,
  image: `${SITE_URL}/cover.jpg`,
})

export default async function HomePage() {
  return <ClientHomePage schema={schema} />
}
