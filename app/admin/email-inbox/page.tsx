import AdminDashboardPageClient from "../dashboard/AdminDashboardPageClient"

export const runtime = 'nodejs'

export default function AdminEmailInboxPage() {
  return <AdminDashboardPageClient initialSection="inbox" />
}
