import { PageHeader } from "@/components/admin/page-header"
import { AdminDashboardSectionPage, getSectionCopy } from "../dashboard/AdminDashboardSectionPage"
import type { SectionId } from "../dashboard/sections"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SECTION: SectionId = "inbox"

export default function AdminEmailInboxPage() {
  const { title, description } = getSectionCopy(SECTION)

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
  )
}
