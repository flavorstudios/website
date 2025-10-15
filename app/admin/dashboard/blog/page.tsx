import AdminDashboardPageClient from "../AdminDashboardPageClient";

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export default function BlogPage() {
  return <AdminDashboardPageClient initialSection="blogs" />;
}