import { AdminSectionPage } from "@/components/admin/dashboard/AdminSectionPage";
import type { SectionId } from "../dashboard/sections";
import { getMetadata } from "@/lib/seo-utils";
import { SITE_NAME, SITE_URL, SITE_BRAND_TWITTER } from "@/lib/constants";

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export const metadata = getMetadata({
  title: `Video Manager – ${SITE_NAME} Admin`,
  description: `Upload, organize, and publish video content for ${SITE_NAME}.`,
  path: "/admin/videos",
  robots: "noindex, nofollow",
  openGraph: {
    title: `Video Manager – ${SITE_NAME} Admin`,
    description: `Upload, organize, and publish video content for ${SITE_NAME}.`,
    url: `${SITE_URL}/admin/videos`,
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
    title: `Video Manager – ${SITE_NAME} Admin`,
    description: `Upload, organize, and publish video content for ${SITE_NAME}.`,
    images: [`${SITE_URL}/cover.jpg`],
  },
});

const SECTION: SectionId = "videos";

export default function AdminVideosPage() {
  return <AdminSectionPage section={SECTION} />;
}