import AdminDashboardPageClient from "../dashboard/AdminDashboardPageClient"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export default function AdminEmailInboxPage() {
  return <AdminDashboardPageClient initialSection="inbox" />
}
