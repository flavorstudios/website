import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar, Clock, Search } from "lucide-react"

export default function BlogPage() {
  const blogPosts = [
    {
      id: 1,
      title: "New Anime Season Preview: What to Watch This Fall",
      excerpt:
        "Discover the most anticipated anime releases coming this season, from action-packed adventures to heartwarming slice-of-life stories.",
      date: "2024-01-15",
      readTime: "5 min read",
      category: "News",
      image: "/placeholder.svg?height=200&width=300&query=anime season preview fall",
      featured: true,
    },
    {
      id: 2,
      title: "Behind the Scenes: Creating Our Latest Original Series",
      excerpt:
        "Take a look at our creative process and the making of our newest project, from initial concept to final animation.",
      date: "2024-01-12",
      readTime: "8 min read",
      category: "Studio Updates",
      image: "/placeholder.svg?height=200&width=300&query=anime production behind scenes",
    },
    {
      id: 3,
      title: "Top 10 Underrated Anime You Should Watch",
      excerpt:
        "Hidden gems that deserve more recognition in the anime community, featuring diverse genres and unique storytelling.",
      date: "2024-01-10",
      readTime: "6 min read",
      category: "Reviews",
      image: "/placeholder.svg?height=200&width=300&query=underrated anime collection",
    },
    {
      id: 4,
      title: "The Evolution of Anime Art Styles Through the Decades",
      excerpt:
        "Exploring how anime art has transformed from the 1960s to today, and what trends we might see in the future.",
      date: "2024-01-08",
      readTime: "10 min read",
      category: "Analysis",
      image: "/placeholder.svg?height=200&width=300&query=anime art evolution timeline",
    },
    {
      id: 5,
      title: "Interview: Rising Voice Actors in the Anime Industry",
      excerpt: "Conversations with talented voice actors who are making their mark in the anime world.",
      date: "2024-01-05",
      readTime: "7 min read",
      category: "Interviews",
      image: "/placeholder.svg?height=200&width=300&query=voice actor interview studio",
    },
    {
      id: 6,
      title: "Anime Conventions 2024: Complete Guide",
      excerpt:
        "Your comprehensive guide to the biggest anime conventions happening this year, including schedules and highlights.",
      date: "2024-01-03",
      readTime: "4 min read",
      category: "Events",
      image: "/placeholder.svg?height=200&width=300&query=anime convention crowd cosplay",
    },
  ]

  const categories = ["All", "News", "Studio Updates", "Reviews", "Analysis", "Interviews", "Events"]

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Anime News & Updates</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Stay informed with the latest anime industry news, reviews, and insights from Flavor Studios.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input placeholder="Search articles..." className="pl-10" />
            </div>
            <Button variant="outline">Search</Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={category === "All" ? "default" : "secondary"}
                className="cursor-pointer hover:bg-blue-600 hover:text-white"
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>

        {/* Featured Post */}
        {blogPosts
          .filter((post) => post.featured)
          .map((post) => (
            <Card key={post.id} className="mb-12 overflow-hidden">
              <div className="grid lg:grid-cols-2 gap-0">
                <div className="aspect-video lg:aspect-auto">
                  <img src={post.image || "/placeholder.svg"} alt={post.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-8 flex flex-col justify-center">
                  <Badge className="w-fit mb-4 bg-blue-600">{post.category}</Badge>
                  <h2 className="text-3xl font-bold mb-4">{post.title}</h2>
                  <p className="text-gray-600 mb-6 text-lg">{post.excerpt}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {post.date}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {post.readTime}
                    </div>
                  </div>
                  <Button asChild className="w-fit">
                    <Link href={`/blog/${post.id}`}>Read Full Article</Link>
                  </Button>
                </div>
              </div>
            </Card>
          ))}

        {/* Blog Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts
            .filter((post) => !post.featured)
            .map((post) => (
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
                    <span className="text-sm text-gray-500">{post.readTime}</span>
                  </div>
                  <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                  <CardDescription className="line-clamp-3">{post.excerpt}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <Calendar className="h-4 w-4" />
                    {post.date}
                  </div>
                  <Button asChild variant="ghost" className="w-full">
                    <Link href={`/blog/${post.id}`}>Read More</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            Load More Articles
          </Button>
        </div>
      </div>
    </div>
  )
}
