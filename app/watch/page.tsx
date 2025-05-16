import Link from "next/link"
import Image from "next/image"
import { Search, Filter, Play, Clock, Calendar, BarChart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Youtube } from "lucide-react"

export default function WatchPage() {
  const videoCategories = ["All", "Reviews", "Analysis", "Top 10", "Tutorials", "Reactions", "Behind the Scenes"]

  const videos = [
    {
      id: "top-10-anime-openings",
      title: "Top 10 Anime Openings of All Time",
      excerpt: "Counting down the most iconic and memorable anime opening sequences that defined the medium.",
      category: "Top 10",
      date: "May 18, 2023",
      duration: "15:42",
      views: "145K",
      image: "anime%20openings%20collage",
    },
    {
      id: "demon-slayer-animation-analysis",
      title: "Demon Slayer: Breaking Down the Revolutionary Animation",
      excerpt: "Analyzing the groundbreaking animation techniques that made Demon Slayer a visual phenomenon.",
      category: "Analysis",
      date: "June 22, 2023",
      duration: "18:29",
      views: "253K",
      image: "demon%20slayer%20animation%20breakdown",
    },
    {
      id: "anime-studio-tour",
      title: "Inside a Japanese Anime Studio: Exclusive Tour",
      excerpt: "Get a rare behind-the-scenes look at how your favorite anime is made in this exclusive studio tour.",
      category: "Behind the Scenes",
      date: "April 5, 2023",
      duration: "22:17",
      views: "198K",
      image: "anime%20studio%20tour",
    },
    {
      id: "spring-2023-anime-guide",
      title: "Spring 2023 Anime Season: What to Watch",
      excerpt: "Our comprehensive guide to the must-watch anime of the Spring 2023 season.",
      category: "Reviews",
      date: "March 29, 2023",
      duration: "12:33",
      views: "87K",
      image: "spring%202023%20anime%20season",
    },
    {
      id: "animation-techniques-tutorial",
      title: "Basic Animation Techniques for Beginners",
      excerpt: "Learn the fundamental principles of animation that professionals use to bring characters to life.",
      category: "Tutorials",
      date: "February 15, 2023",
      duration: "24:51",
      views: "115K",
      image: "animation%20techniques%20tutorial",
    },
    {
      id: "attack-on-titan-finale-reaction",
      title: "LIVE REACTION: Attack on Titan Series Finale",
      excerpt: "Watch our team react in real-time to the epic conclusion of Attack on Titan.",
      category: "Reactions",
      date: "January 8, 2023",
      duration: "32:07",
      views: "327K",
      image: "attack%20on%20titan%20finale%20reaction",
    },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background to-background z-0"></div>
        <div className="container relative z-10 mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-orbitron tracking-tight">
              <span className="gradient-text">Watch Our Content</span>
            </h1>
            <p className="text-xl max-w-3xl mx-auto mb-8 text-muted-foreground">
              Explore our original anime-inspired videos, reviews, analyses, and more.
            </p>
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search videos..." className="pl-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Video Categories */}
      <section className="py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-between items-center">
            <div className="flex flex-wrap gap-2">
              {videoCategories.map((category, index) => (
                <Button
                  key={index}
                  variant={index === 0 ? "default" : "outline"}
                  size="sm"
                  className={index === 0 ? "" : "hover:bg-primary/10"}
                >
                  {category}
                </Button>
              ))}
            </div>
            <Button variant="outline" size="sm" className="flex items-center space-x-1">
              <Filter className="h-4 w-4 mr-1" />
              Filter
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Video */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto overflow-hidden rounded-lg border border-primary/20 shadow-lg animate-glow">
            <div className="relative aspect-video group">
              <Image
                src="/placeholder.svg?key=ueltc"
                alt="Featured Video"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/60">
                <Link href="/watch/demon-slayer-animation-analysis">
                  <Button
                    size="lg"
                    className="rounded-full bg-primary/90 hover:bg-primary h-16 w-16 flex items-center justify-center"
                  >
                    <Play className="h-8 w-8 ml-1" />
                  </Button>
                </Link>
              </div>
              <div className="absolute bottom-4 right-4 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                18:29
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent pt-10 px-6 pb-6">
                <Link
                  href="/watch/demon-slayer-animation-analysis"
                  className="text-xl md:text-2xl font-bold text-white hover:text-primary transition-colors font-orbitron"
                >
                  Demon Slayer: Breaking Down the Revolutionary Animation
                </Link>
                <div className="flex items-center space-x-4 text-xs text-gray-300 mt-2">
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    June 22, 2023
                  </div>
                  <div className="flex items-center">
                    <BarChart className="h-3 w-3 mr-1" />
                    253K views
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Grid */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-10 font-orbitron">Latest Videos</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videos.map((video) => (
              <Card
                key={video.id}
                className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-primary/50"
              >
                <CardContent className="p-0">
                  <Link href={`/watch/${video.id}`}>
                    <div className="relative aspect-video group">
                      <Image
                        src={`/abstract-geometric-shapes.png?key=z8rxl&key=mwj3z&height=360&width=640&query=${video.image}`}
                        alt={video.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/60">
                        <Button size="icon" className="rounded-full bg-primary/90 hover:bg-primary h-12 w-12">
                          <Play className="h-6 w-6 ml-0.5" />
                        </Button>
                      </div>
                      <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {video.duration}
                      </div>
                    </div>
                  </Link>
                  <div className="p-5">
                    <div className="mb-3 flex justify-between items-center">
                      <span className="inline-block bg-primary/10 text-primary text-xs px-3 py-1 rounded-full">
                        {video.category}
                      </span>
                      <span className="text-xs text-muted-foreground">{video.views} views</span>
                    </div>
                    <Link href={`/watch/${video.id}`} className="hover:text-primary transition-colors">
                      <h3 className="font-bold text-lg mb-2 font-orbitron line-clamp-2">{video.title}</h3>
                    </Link>
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-2">{video.excerpt}</p>
                    <div className="text-xs text-muted-foreground">{video.date}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-center mt-12">
            <Button className="bg-primary hover:bg-primary/90">Load More Videos</Button>
          </div>
        </div>
      </section>

      {/* Subscribe CTA */}
      <section className="py-16 md:py-24 bg-primary/5 border-y border-primary/20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 font-orbitron">Never Miss a Video</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Subscribe to our YouTube channel to get notified when we post new content.
            </p>
            <Button asChild size="lg" className="bg-red-600 hover:bg-red-700">
              <Link href="https://youtube.com" target="_blank">
                <Youtube className="mr-2 h-5 w-5" />
                Subscribe on YouTube
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
