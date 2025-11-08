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

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export default function AdminCommentsPage() {
  const section: SectionId = "comments";
  const headingId = "admin-comments-heading";
  const title = SECTION_HEADINGS[section];
  const description = SECTION_DESCRIPTIONS[section];

  return (
    <HeadingLevelRoot>
      <PageHeader
        headingId={headingId}
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
            section={section}
            suppressHeading
            headingId={headingId}
          />
        </HeadingLevelBoundary>
      </AdminShellProvider>
    </HeadingLevelRoot>
  );
}