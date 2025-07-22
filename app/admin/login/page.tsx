// app/admin/login/page.tsx

import { getMetadata } from "@/lib/seo-utils";
import { SITE_NAME, SITE_URL, SITE_BRAND_TWITTER } from "@/lib/constants";
import AdminLoginForm from "./AdminLoginForm";

// --- SEO METADATA: Admin pages must be noindex, nofollow ---
export const metadata = getMetadata({
  title: `Admin Login – ${SITE_NAME}`,
  description: `Login securely to manage ${SITE_NAME} content, blogs, and creative assets.`,
  path: "/admin/login",
  robots: "noindex, nofollow",
  openGraph: {
    title: `Admin Login – ${SITE_NAME}`,
    description: `Login securely to manage ${SITE_NAME} content, blogs, and creative assets.`,
    type: "website",
    siteName: SITE_NAME,
    images: [
      {
        url: `${SITE_URL}/cover.jpg`,
        width: 1200,
        height: 630,
        alt: `Admin login cover for ${SITE_NAME}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: SITE_BRAND_TWITTER,
    creator: SITE_BRAND_TWITTER,
    title: `Admin Login – ${SITE_NAME}`,
    description: `Access all admin tools to manage posts, videos, comments, and more for ${SITE_NAME} from a single secure dashboard.`,
    images: [`${SITE_URL}/cover.jpg`],
  },
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  // No JSON-LD/schema for admin pages
});

export default function AdminLoginPage() {
  // No client-side redirect or session check; handled by middleware!
  return <AdminLoginForm />;
}
