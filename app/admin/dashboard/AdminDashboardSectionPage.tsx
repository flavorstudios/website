import AdminDashboardPageClient from "./AdminDashboardPageClient";
import type { SectionId } from "./sections";

interface AdminDashboardSectionPageProps {
  section: SectionId;
}

export function AdminDashboardSectionPage({ section }: AdminDashboardSectionPageProps) {
  return <AdminDashboardPageClient initialSection={section} />;
}