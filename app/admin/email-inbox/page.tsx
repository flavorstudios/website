import { AdminDashboardSectionPage } from "../dashboard/AdminDashboardSectionPage"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export default function AdminEmailInboxPage() {
  return <AdminDashboardSectionPage section="inbox" />
}
