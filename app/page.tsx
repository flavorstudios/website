import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Calendar, Users, Youtube } from "lucide-react"

export default function HomePage() {
  const featuredPosts = [
    {
      id: 1,
      title: "New Anime Season Preview: What to Watch This Fall",
      excerpt: "Discover the most anticipated anime releases coming this season...",
      date: "2024-01-15",
      category: "News",
      image: "/placeholder.svg?height=200&width=300&query=anime season preview",
    },
    {
      id: 2,
      title: "Behind the Scenes: Creating Our Latest Original Series",
      excerpt: "Take a look at our creative process and the making of our newest project...",
      date: "2024-01-12",
      category: "Studio Updates",
      image: "/placeholder.svg?height=200&width=300&query=anime production behind scenes",
    },
    {
      id: 3,
      title: "Top 10 Underrated Anime You Should Watch",
      excerpt: "Hidden gems that deserve more recognition in the anime community...",
      date: "2024-01-10",
      category: "Reviews",
      image: "/placeholder.svg?height=200&width=300&query=underrated anime collection",
    },
  ]

  const featuredVideos = [
    {
      id: 1,
      title: "Flavor Studios Original: Mystic Chronicles Episode 1",
      thumbnail: "/placeholder.svg?height=180&width=320&query=anime episode thumbnail mystic",
      duration: "24:30",
      views: "125K",
    },
    {
      id: 2,
      title: "Anime News Weekly: Latest Industry Updates",
      thumbnail: "/placeholder.svg?height=180&width=320&query=anime news studio setup",
      duration: "15:45",
      views: "89K",
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge className="bg-blue-600 hover:bg-blue-700 text-white">Independent Anime Studio</Badge>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Welcome to{" "}
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Flavor Studios
                </span>
              </h1>
              <p className="text-xl text-gray-300 leading-relaxed">
                Your destination for original anime content, industry news, and creative storytelling. We're passionate
                creators bringing unique anime experiences to life.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <Link href="/watch">
                    <Play className="mr-2 h-5 w-5" />
                    Watch Our Content
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-blue-900"
                >
                  <Link href="/about">Learn About Us</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-video rounded-lg overflow-hidden shadow-2xl">
                <iframe
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                  title="Flavor Studios Showcase"
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">500K+</div>
              <div className="text-gray-600">YouTube Subscribers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">50+</div>
              <div className="text-gray-600">Original Episodes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">2M+</div>
              <div className="text-gray-600">Total Views</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">5</div>
              <div className="text-gray-600">Years Creating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Content */}
      <section className="py-16">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Latest from Flavor Studios</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Stay updated with our newest anime content, industry insights, and behind-the-scenes stories.
            </p>
          </div>

          {/* Featured Videos */}
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-semibold flex items-center">
                <Youtube className="mr-2 h-6 w-6 text-red-600" />
                Featured Videos
              </h3>
              <Button asChild variant="outline">
                <Link href="/watch">View All</Link>
              </Button>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {featuredVideos.map((video) => (
                <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img
                      src={video.thumbnail || "/placeholder.svg"}
                      alt={video.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                      {video.duration}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black bg-opacity-50">
                      <Play className="h-12 w-12 text-white" />
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2 line-clamp-2">{video.title}</h4>
                    <p className="text-sm text-gray-600">{video.views} views</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Featured Blog Posts */}
          <div>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-semibold flex items-center">
                <Calendar className="mr-2 h-6 w-6 text-blue-600" />
                Latest News & Updates
              </h3>
              <Button asChild variant="outline">
                <Link href="/blog">View All Posts</Link>
              </Button>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {featuredPosts.map((post) => (
                <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={post.image || "/placeholder.svg"}
                      alt={post.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary">{post.category}</Badge>
                      <span className="text-sm text-gray-500">{post.date}</span>
                    </div>
                    <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                    <CardDescription className="line-clamp-3">{post.excerpt}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild variant="ghost" className="w-full">
                      <Link href={`/blog/${post.id}`}>Read More</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <Users className="h-16 w-16 mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl font-bold mb-4">Join the Flavor Studios Community</h2>
          <p className="text-xl mb-8 opacity-90">
            Connect with fellow anime enthusiasts, get exclusive updates, and support our creative journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link href="/support">Support Our Work</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-600"
            >
              <Link href="/contact">Get in Touch</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
