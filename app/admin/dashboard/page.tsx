import AdminDashboardPageClient from "./AdminDashboardPageClient";
import { getMetadata } from "@/lib/seo-utils";
import { SITE_NAME, SITE_URL, SITE_BRAND_TWITTER } from "@/lib/constants";

// === SEO METADATA (ADMIN - NOINDEX) ===
export const metadata = getMetadata({
  title: `${SITE_NAME} Admin Dashboard`,
  description: `Access all admin tools to manage posts, videos, comments, and more for ${SITE_NAME} from a single secure dashboard.`,
  path: "/admin/dashboard",
  robots: "noindex, nofollow", // Secure: admin/internal page
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
    site: SITE_BRAND_TWITTER,
    creator: SITE_BRAND_TWITTER,
    title: `${SITE_NAME} Admin Dashboard`,
    description: `Access all admin tools to manage posts, videos, comments, and more for ${SITE_NAME} from a single secure dashboard.`,
    images: [`${SITE_URL}/cover.jpg`]
  },
  // No schema for admin/noindex pages
});

export default function AdminDashboardPage() {
  return <AdminDashboardPageClient />;
}
