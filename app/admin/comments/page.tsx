import { PageHeader } from "@/components/admin/page-header";
import AdminCommentsPageClient from "./AdminCommentsPageClient";

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export default function AdminCommentsPage() {
  return (
    <>
      <PageHeader
        title="Comments"
        description="Moderate community feedback and keep discussions on track."
        className="sr-only"
        headingClassName="sr-only"
        descriptionClassName="sr-only"
      />
      <AdminCommentsPageClient />
    </>
  );
}