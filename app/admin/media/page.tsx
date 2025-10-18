import { PageHeader } from "@/components/admin/page-header";
import { AdminDashboardSectionPage, getSectionCopy } from "../dashboard/AdminDashboardSectionPage";
import type { SectionId } from "../dashboard/sections";
import { getMetadata } from "@/lib/seo-utils";
import { SITE_NAME, SITE_URL, SITE_BRAND_TWITTER } from "@/lib/constants";

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export const metadata = getMetadata({
  title: `Media Manager – ${SITE_NAME} Admin`,
  description: `Manage and organize media assets for ${SITE_NAME}.`,
  path: "/admin/media",
  robots: "noindex, nofollow",
  openGraph: {
    title: `Media Manager – ${SITE_NAME} Admin`,
    description: `Manage and organize media assets for ${SITE_NAME}.`,
    url: `${SITE_URL}/admin/media`,
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
    title: `Media Manager – ${SITE_NAME} Admin`,
    description: `Manage and organize media assets for ${SITE_NAME}.`,
    images: [`${SITE_URL}/cover.jpg`],
  },
});

const SECTION: SectionId = "media";

export default function AdminMediaPage() {
  const { title, description } = getSectionCopy(SECTION);

  return (
    <>
      <PageHeader
        level={1}
        title={title}
        description={description}
        className="sr-only"
        headingClassName="sr-only"
        descriptionClassName={description ? "sr-only" : undefined}
      />
      <AdminDashboardSectionPage section={SECTION} />
    </>
  );
}