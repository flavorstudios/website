import { PageHeader } from "@/components/admin/page-header";
import AdminDashboardPageClient, {
  SECTION_DESCRIPTIONS,
  SECTION_HEADINGS,
} from "./AdminDashboardPageClient";
import type { SectionId } from "./sections";

interface AdminDashboardSectionPageProps {
  section: SectionId;
}

export function AdminDashboardSectionPage({ section }: AdminDashboardSectionPageProps) {
  const title = SECTION_HEADINGS[section] ?? "Admin Dashboard";
  const description = SECTION_DESCRIPTIONS[section] ?? undefined;

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        className="sr-only"
        headingClassName="sr-only"
        descriptionClassName={description ? "sr-only" : undefined}
      />
      <AdminDashboardPageClient initialSection={section} />
    </>
  );
}