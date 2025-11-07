import { AdminDashboardSectionPage } from "@/app/admin/dashboard/AdminDashboardSectionPage";
import { SECTION_DESCRIPTIONS, SECTION_HEADINGS } from "@/app/admin/dashboard/section-metadata";
import type { SectionId } from "@/app/admin/dashboard/sections";
import { PageHeader } from "@/components/admin/page-header";
import { HeadingLevelBoundary } from "@/components/admin/heading-context";

interface AdminSectionPageProps {
  section: SectionId;
  headingId?: string;
  title?: string;
  description?: string;
}

const DEFAULT_ID_PREFIX = "admin";

export function AdminSectionPage({
  section,
  headingId,
  title,
  description,
}: AdminSectionPageProps) {
  const resolvedHeadingId = headingId ?? `${DEFAULT_ID_PREFIX}-${section}-heading`;
  const heading = title ?? SECTION_HEADINGS[section];
  const details = description ?? SECTION_DESCRIPTIONS[section];

  return (
    <div className="space-y-6">
      <PageHeader
        headingId={resolvedHeadingId}
        title={heading}
        description={details}
        className="mb-2"
        containerClassName="flex-col"
        headingClassName="text-3xl font-semibold tracking-tight text-foreground"
        descriptionClassName="text-sm text-muted-foreground"
      />
      <HeadingLevelBoundary>
        <AdminDashboardSectionPage
          section={section}
          suppressHeading
          headingId={resolvedHeadingId}
        />
      </HeadingLevelBoundary>
    </div>
  );
}