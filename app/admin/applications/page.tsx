import { AdminDashboardSectionPage } from "@/app/admin/dashboard/AdminDashboardSectionPage";
import {
  SECTION_DESCRIPTIONS,
  SECTION_HEADINGS,
} from "@/app/admin/dashboard/section-metadata";
import type { SectionId } from "../dashboard/sections";
import { AdminShellProvider } from "@/components/admin/admin-shell-context";
import {
  HeadingLevelBoundary,
  HeadingLevelRoot,
} from "@/components/admin/heading-context";
import { PageHeader } from "@/components/admin/page-header";
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

const SECTION: SectionId = "applications";
const HEADING_ID = "admin-applications-heading";

export default function AdminApplicationsPage() {
  const title = SECTION_HEADINGS[SECTION];
  const description = SECTION_DESCRIPTIONS[SECTION];

  return (
    <HeadingLevelRoot>
      <PageHeader
        headingId={HEADING_ID}
        title={title}
        description={description}
        className="mb-2"
        containerClassName="flex-col"
        headingClassName="text-3xl font-semibold tracking-tight text-foreground"
        descriptionClassName="text-sm text-muted-foreground"
      />
      <AdminShellProvider variant="dashboard">
        <HeadingLevelBoundary>
          <AdminDashboardSectionPage
            section={SECTION}
            suppressHeading
            headingId={HEADING_ID}
          />
        </HeadingLevelBoundary>
      </AdminShellProvider>
    </HeadingLevelRoot>
  );
}