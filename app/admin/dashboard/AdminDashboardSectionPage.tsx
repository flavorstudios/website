import AdminDashboardPageClient, {
  SECTION_DESCRIPTIONS,
  SECTION_HEADINGS,
} from "./AdminDashboardPageClient";
import type { SectionId } from "./sections";

interface AdminDashboardSectionPageProps {
  section: SectionId;
}

export function getSectionCopy(section: SectionId) {
  return {
    title: SECTION_HEADINGS?.[section] ?? "Admin Dashboard",
    description: SECTION_DESCRIPTIONS?.[section] ?? undefined,
  } as const;
}

export function AdminDashboardSectionPage({ section }: AdminDashboardSectionPageProps) {
  return <AdminDashboardPageClient initialSection={section} />;
}