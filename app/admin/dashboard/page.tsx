import { blogStore, videoStore, commentStore, pageStore, systemStore, initializeSampleData } from "@/lib/admin-store"
import { AdminDashboard } from "./components/admin-dashboard"

export default async function DashboardPage() {
  // Initialize sample data if needed
  await initializeSampleData()

  const [blogs, videos, comments, pages, stats] = await Promise.all([
    blogStore.getAll(),
    videoStore.getAll(),
    commentStore.getAll(),
    pageStore.getAll(),
    systemStore.getStats(),
  ])

  return (
    <AdminDashboard
      initialBlogs={blogs}
      initialVideos={videos}
      initialComments={comments}
      initialPages={pages}
      initialStats={stats}
    />
  )
}
