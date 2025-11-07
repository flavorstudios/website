import { AdminSectionPage } from "@/components/admin/dashboard/AdminSectionPage";
import type { SectionId } from "../dashboard/sections";

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export default function AdminCommentsPage() {
  const section: SectionId = "comments";
  return <AdminSectionPage section={section} />;
}