import { getDynamicCategories } from "@/lib/data"
import VideoGrid from "@/components/VideoGrid"

async function getWatchData() {
  try {
    const [videosResponse, { videoCategories }] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/admin/videos`, {
        cache: "no-store",
      }).catch(() => ({ ok: false, json: () => Promise.resolve({ videos: [] }) })),
      getDynamicCategories().catch(() => ({
        blogCategories: [],
        videoCategories: [
          { name: "Episodes", slug: "episodes", count: 0, order: 0 },
          { name: "Shorts", slug: "shorts", count: 0, order: 1 },
          { name: "Behind the Scenes", slug: "behind-the-scenes", count: 0, order: 2 },
          { name: "Tutorials", slug: "tutorials", count: 0, order: 3 },
        ],
      })),
    ])

    let videos = []
    if (videosResponse.ok) {
      const videosData = await videosResponse.json()
      videos = (videosData.videos || []).filter((video: any) => video.status === "published")
    }

    return { videos, categories: videoCategories }
  } catch (error) {
    console.error("Failed to fetch watch data:", error)
    return {
      videos: [],
      categories: [
        { name: "Episodes", slug: "episodes", count: 0, order: 0 },
        { name: "Shorts", slug: "shorts", count: 0, order: 1 },
        { name: "Behind the Scenes", slug: "behind-the-scenes", count: 0, order: 2 },
        { name: "Tutorials", slug: "tutorials", count: 0, order: 3 },
      ],
    }
  }
}

export default async function Watch() {
  const { videos, categories } = await getWatchData()

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-5">Watch</h1>
      <VideoGrid videos={videos} categories={categories} />
    </div>
  )
}
