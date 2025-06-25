import AdminDashboardPageClient from "./AdminDashboardPageClient"
import { SITE_NAME, SITE_URL } from "@/lib/constants"

// --- SEO Elements (except JSON-LD/Schema) ---
export const metadata = {
  title: `${SITE_NAME} Admin Dashboard`,
  description: `Access all admin tools to manage posts, videos, comments, and more for ${SITE_NAME} from a single secure dashboard.`,
  alternates: {
    canonical: `${SITE_URL}/admin/dashboard`,
  },
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: `${SITE_NAME} Admin Dashboard`,
    description: `Access all admin tools to manage posts, videos, comments, and more for ${SITE_NAME} from a single secure dashboard.`,
    url: `${SITE_URL}/admin/dashboard`,
    siteName: SITE_NAME,
    type: "website",
    images: [
      {
        url: `${SITE_URL}/cover.jpg`,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} Cover Image`
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    site: "@flavorstudios",
    creator: "@flavorstudios",
    title: `${SITE_NAME} Admin Dashboard`,
    description: `Access all admin tools to manage posts, videos, comments, and more for ${SITE_NAME} from a single secure dashboard.`,
    images: [`${SITE_URL}/cover.jpg`]
  }
}

// --- Server Component ---
export default function AdminDashboardPage() {
  return <AdminDashboardPageClient />
}
