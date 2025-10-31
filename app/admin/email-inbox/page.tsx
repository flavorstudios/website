import { AdminDashboardSectionPage } from "../dashboard/AdminDashboardSectionPage"
import type { SectionId } from "../dashboard/sections"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SECTION: SectionId = "inbox"

export default function AdminEmailInboxPage() {
  return <AdminDashboardSectionPage section={SECTION} />
}
