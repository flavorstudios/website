import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Eye, User, Play } from "lucide-react"
import { JsonLd } from "@/components/seo/json-ld"
import { generateVideoSchema } from "@/lib/seo-utils"

async function getVideoDetails(slug: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "https://flavorstudios.in"}/api/admin/videos`, {
      cache: "no-store",
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    const videos = data.videos || []

    return videos.find((video: any) => video.slug === slug && video.status === "published") || null
  } catch (error) {
    console.error("Failed to fetch video:", error)
    return null
  }
}

interface WatchPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: WatchPageProps): Promise<Metadata> {
  const video = await getVideoDetails(params.slug)

  if (!video) {
    return {
      title: "Video Not Found",
      description: "The requested video could not be found.",
    }
  }

  return {
    title: `${video.title} | Watch Anime | Flavor Studios`,
    description:
      video.description ||
      "Watch this anime episode from Flavor Studios featuring original storytelling and 3D animation.",
    openGraph: {
      title: video.title,
      description:
        video.description ||
        "Watch this anime episode from Flavor Studios featuring original storytelling and 3D animation.",
      type: "video.other",
      url: `https://flavorstudios.in/watch/${params.slug}`,
      images: [video.thumbnail || "/og-image.jpg"],
      videos: video.youtubeId ? [`https://www.youtube.com/watch?v=${video.youtubeId}`] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: video.title,
      description:
        video.description ||
        "Watch this anime episode from Flavor Studios featuring original storytelling and 3D animation.",
      images: [video.thumbnail || "/og-image.jpg"],
    },
    alternates: {
      canonical: `https://flavorstudios.in/watch/${params.slug}`,
    },
  }
}

export default async function WatchPage({ params }: WatchPageProps) {
  const video = await getVideoDetails(params.slug)

  if (!video) {
    notFound()
  }

  const videoSchema = {
    title: video.title,
    description: video.description || "",
    thumbnail: video.thumbnail,
    publishedAt: video.publishedAt,
    slug: params.slug,
    youtubeId: video.youtubeId,
  }

  return (
    <>
      <JsonLd data={generateVideoSchema(videoSchema)} />
      <div className="min-h-screen bg-gray-50">
        <article className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="outline">{video.category}</Badge>
              <span className="text-sm text-gray-500 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(video.publishedAt).toLocaleDateString()}
              </span>
              {video.episodeNumber && <Badge variant="secondary">Episode {video.episodeNumber}</Badge>}
              {video.season && <Badge variant="secondary">{video.season}</Badge>}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">{video.title}</h1>

            <p className="text-xl text-gray-600 mb-6">{video.description}</p>

            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                Flavor Studios
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {video.views?.toLocaleString() || 0} views
              </span>
              <span className="flex items-center gap-1">
                <Play className="h-4 w-4" />
                {video.duration || "Watch Now"}
              </span>
            </div>
          </header>

          {/* Video Player */}
          <div className="mb-8">
            <Card>
              <CardContent className="p-0">
                {video.youtubeId ? (
                  <div className="aspect-video">
                    <iframe
                      src={`https://www.youtube.com/embed/${video.youtubeId}`}
                      title={video.title}
                      className="w-full h-full rounded-lg"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  </div>
                ) : video.thumbnail ? (
                  <div className="aspect-video relative">
                    <img
                      src={video.thumbnail || "/placeholder.svg"}
                      alt={video.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                      <Play className="h-16 w-16 text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-200 flex items-center justify-center rounded-lg">
                    <Play className="h-16 w-16 text-gray-400" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Video Details */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>About This Episode</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">
                    {video.description ||
                      "Experience this original anime content from Flavor Studios, crafted with passion and attention to detail."}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {/* Episode Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Episode Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {video.episodeNumber && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Episode:</span>
                      <span className="font-medium">{video.episodeNumber}</span>
                    </div>
                  )}
                  {video.season && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Season:</span>
                      <span className="font-medium">{video.season}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium">{video.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Released:</span>
                    <span className="font-medium">{new Date(video.publishedAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Related Videos */}
              <Card>
                <CardHeader>
                  <CardTitle>More Episodes</CardTitle>
                  <CardDescription>Explore more content from Flavor Studios</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Check out our other episodes and original anime content on our Watch page.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </article>
      </div>
    </>
  )
}
