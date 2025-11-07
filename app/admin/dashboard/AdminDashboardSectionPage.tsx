import AdminDashboardPageClient from "./AdminDashboardPageClient";
import type { HeadingLevel } from "./page-heading";
import type { SectionId } from "./sections";

export interface AdminDashboardSectionPageProps {
  section: SectionId;
  headingLevel?: HeadingLevel;
  suppressHeading?: boolean;
  headingId?: string;
}

export function AdminDashboardSectionPage({
  section,
  headingLevel,
  suppressHeading,
  headingId,
}: AdminDashboardSectionPageProps) {
  return (
    <AdminDashboardPageClient
      initialSection={section}
      headingLevel={headingLevel}
      suppressHeading={suppressHeading}
      headingId={headingId}
    />
  );
}