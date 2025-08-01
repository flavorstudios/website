import AdminDashboardPageClient from "../AdminDashboardPageClient"
import { getMetadata } from "@/lib/seo-utils"
import { SITE_NAME, SITE_URL, SITE_BRAND_TWITTER } from "@/lib/constants"

export const metadata = getMetadata({
  title: `Career Applications – ${SITE_NAME} Admin`,
  description: `View and manage career submissions for ${SITE_NAME}.`,
  path: "/admin/dashboard/career-applications",
  robots: "noindex, nofollow",
  openGraph: {
    title: `Career Applications – ${SITE_NAME} Admin`,
    description: `View and manage career submissions for ${SITE_NAME}.`,
    url: `${SITE_URL}/admin/dashboard/career-applications`,
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
    title: `Career Applications – ${SITE_NAME} Admin`,
    description: `View and manage career submissions for ${SITE_NAME}.`,
    images: [`${SITE_URL}/cover.jpg`],
  },
})

export default function CareerApplicationsPage() {
  return <AdminDashboardPageClient initialSection="career-applications" />
}