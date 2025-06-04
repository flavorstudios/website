import { videoStore } from "@/lib/content-store"
import { getCategoriesWithFallback } from "@/lib/dynamic-categories"
import { WatchPageClient } from "./WatchPageClient"

export default async function WatchPage({ searchParams }: { searchParams: { category?: string; page?: string } }) {
  const [videos, { videoCategories }] = await Promise.all([
    videoStore.getPublished().catch(() => []),
    getCategoriesWithFallback(),
  ])

  return (
    <WatchPageClient initialVideos={videos || []} initialCategories={videoCategories || []} searchParams={searchParams} />
  )
}
