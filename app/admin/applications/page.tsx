import { AdminDashboardSectionPage } from "../dashboard/AdminDashboardSectionPage";
import { getMetadata } from "@/lib/seo-utils";
import { SITE_NAME, SITE_URL, SITE_BRAND_TWITTER } from "@/lib/constants";

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export const metadata = getMetadata({
  title: `Applications – ${SITE_NAME} Admin`,
  description: `Review and manage career applications for ${SITE_NAME}.`,
  path: "/admin/applications",
  robots: "noindex, nofollow",
  openGraph: {
    title: `Applications – ${SITE_NAME} Admin`,
    description: `Review and manage career applications for ${SITE_NAME}.`,
    url: `${SITE_URL}/admin/applications`,
    siteName: SITE_NAME,
    type: "website",
    images: [
      {
        url: `${SITE_URL}/cover.jpg`,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} Cover Image`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: SITE_BRAND_TWITTER,
    creator: SITE_BRAND_TWITTER,
    title: `Applications – ${SITE_NAME} Admin`,
    description: `Review and manage career applications for ${SITE_NAME}.`,
    images: [`${SITE_URL}/cover.jpg`],
  },
});

export default function AdminApplicationsPage() {
  return <AdminDashboardSectionPage section="applications" />;
}