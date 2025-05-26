import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, Eye, Calendar } from "lucide-react"
import Link from "next/link"

export default function WatchPage() {
  const originalSeries = [
    {
      id: 1,
      title: "Mystic Chronicles",
      description:
        "Follow the adventures of young mages discovering their powers in a world where magic and technology collide.",
      episodes: 12,
      status: "Ongoing",
      thumbnail: "/placeholder.svg?height=300&width=400&query=mystic anime series magic",
      views: "2.5M",
      rating: "9.2/10",
    },
    {
      id: 2,
      title: "Neon Dreams",
      description: "A cyberpunk tale of hackers and AI in a dystopian future where reality and virtual worlds blur.",
      episodes: 8,
      status: "Completed",
      thumbnail: "/placeholder.svg?height=300&width=400&query=cyberpunk anime neon city",
      views: "1.8M",
      rating: "8.9/10",
    },
  ]

  const latestEpisodes = [
    {
      id: 1,
      title: "Mystic Chronicles Episode 12: The Final Awakening",
      series: "Mystic Chronicles",
      duration: "24:30",
      uploadDate: "2024-01-15",
      thumbnail: "/placeholder.svg?height=180&width=320&query=anime episode thumbnail mystic finale",
      views: "125K",
    },
    {
      id: 2,
      title: "Behind the Scenes: Creating Neon Dreams",
      series: "Special Content",
      duration: "15:45",
      uploadDate: "2024-01-12",
      thumbnail: "/placeholder.svg?height=180&width=320&query=anime production behind scenes neon",
      views: "89K",
    },
    {
      id: 3,
      title: "Anime News Weekly: January 2024 Roundup",
      series: "News",
      duration: "18:20",
      uploadDate: "2024-01-10",
      thumbnail: "/placeholder.svg?height=180&width=320&query=anime news studio setup weekly",
      views: "156K",
    },
    {
      id: 4,
      title: "Character Design Process: From Sketch to Animation",
      series: "Educational",
      duration: "22:15",
      uploadDate: "2024-01-08",
      thumbnail: "/placeholder.svg?height=180&width=320&query=anime character design process",
      views: "203K",
    },
  ]

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-3 sm:mb-4 bg-blue-600 text-white px-3 py-1 text-xs sm:text-sm">
            Original Content & Series
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
            Watch Our Content
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover our original anime series, behind-the-scenes content, and the latest anime news videos.
          </p>
        </div>

        {/* Original Series */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Original Series</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {originalSeries.map((series) => (
              <Card key={series.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={series.thumbnail || "/placeholder.svg"}
                    alt={series.title}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                      <Play className="mr-2 h-5 w-5" />
                      Watch Now
                    </Button>
                  </div>
                  <Badge className="absolute top-4 left-4 bg-blue-600">{series.status}</Badge>
                </div>
                <CardHeader>
                  <CardTitle className="text-2xl">{series.title}</CardTitle>
                  <CardDescription className="text-base">{series.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <span>{series.episodes} Episodes</span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {series.views} views
                    </span>
                    <span>⭐ {series.rating}</span>
                  </div>
                  <Button asChild className="w-full">
                    <Link href={`/watch/${series.id}`}>View Series</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Latest Episodes */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Latest Episodes & Videos</h2>
            <Button asChild variant="outline">
              <Link href="https://www.youtube.com/@flavorstudios" target="_blank">
                View All on YouTube
              </Link>
            </Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
            {latestEpisodes.map((episode) => (
              <Card key={episode.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={episode.thumbnail || "/placeholder.svg"}
                    alt={episode.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                    {episode.duration}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black bg-opacity-50">
                    <Play className="h-12 w-12 text-white" />
                  </div>
                </div>
                <CardHeader>
                  <Badge variant="secondary" className="w-fit mb-2">
                    {episode.series}
                  </Badge>
                  <CardTitle className="line-clamp-2 text-lg">{episode.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {episode.uploadDate}
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {episode.views} views
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* YouTube Channel CTA */}
        <section className="mt-16 text-center bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg p-12">
          <h2 className="text-3xl font-bold mb-4">Subscribe to Our YouTube Channel</h2>
          <p className="text-xl mb-8 opacity-90">
            Don't miss any of our latest content! Subscribe for weekly episodes, behind-the-scenes content, and anime
            news.
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link href="https://www.youtube.com/@flavorstudios" target="_blank">
              Subscribe on YouTube
            </Link>
          </Button>
        </section>
      </div>
    </div>
  )
}
