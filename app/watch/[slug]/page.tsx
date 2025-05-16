import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Calendar, ThumbsUp, Share2, Bookmark, Eye, MessageCircle, Play, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getEpisodeData } from "@/lib/episodes"

interface VideoPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: VideoPageProps): Promise<Metadata> {
  const episode = await getEpisodeData(params.slug)

  return {
    title: `${episode.title} – Watch on Flavor Studios`,
    description: episode.synopsis || "Stream the latest episode from Flavor Studios, crafted with care.",
    openGraph: {
      title: `${episode.title} – Watch on Flavor Studios`,
      description: episode.synopsis || "Stream the latest episode from Flavor Studios, crafted with care.",
      type: "video",
      videos: [
        {
          url: `https://flavorstudios.in/watch/${params.slug}`,
          type: "video/mp4",
        },
      ],
      images: [episode.thumbnail],
    },
  }
}

export default function VideoPage({ params }: VideoPageProps) {
  const { slug } = params

  // In a real app, you would fetch the video data based on the slug
  // For this example, we'll use hardcoded data
  const video = {
    id: "demon-slayer-animation-analysis",
    title: "Demon Slayer: Breaking Down the Revolutionary Animation",
    description:
      "Analyzing the groundbreaking animation techniques that made Demon Slayer a visual phenomenon in the anime industry.",
    category: "Analysis",
    date: "June 22, 2023",
    duration: "18:29",
    views: "253K",
    likes: "24.5K",
    image: "demon%20slayer%20animation%20breakdown%20high%20quality",
    tags: ["demon slayer", "animation", "analysis", "ufotable"],
    relatedVideos: [
      {
        id: "top-10-anime-openings",
        title: "Top 10 Anime Openings of All Time",
        category: "Top 10",
        duration: "15:42",
        views: "145K",
        image: "anime%20openings%20collage",
      },
      {
        id: "anime-studio-tour",
        title: "Inside a Japanese Anime Studio: Exclusive Tour",
        category: "Behind the Scenes",
        duration: "22:17",
        views: "198K",
        image: "anime%20studio%20tour",
      },
      {
        id: "spring-2023-anime-guide",
        title: "Spring 2023 Anime Season: What to Watch",
        category: "Reviews",
        duration: "12:33",
        views: "87K",
        image: "spring%202023%20anime%20season",
      },
    ],
  }

  const comments = [
    {
      id: 1,
      author: "AnimeExpert42",
      avatar: "anime%20profile%20pic%201",
      content:
        "This is by far the best breakdown of Demon Slayer's animation I've seen! The way you explained the different techniques really helped me appreciate the show even more.",
      date: "2 days ago",
      likes: 342,
    },
    {
      id: 2,
      author: "SakuraChan",
      avatar: "anime%20profile%20pic%202",
      content:
        "I never realized how much work went into creating those water effects. Ufotable deserves all the praise they get!",
      date: "1 week ago",
      likes: 215,
    },
    {
      id: 3,
      author: "OtakuMaster99",
      avatar: "anime%20profile%20pic%203",
      content: "Can you do a similar analysis for Jujutsu Kaisen next? Their animation is also incredible!",
      date: "2 weeks ago",
      likes: 167,
    },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      {/* Video Section */}
      <section className="py-8 md:py-12 bg-card">
        <div className="container mx-auto px-4">
          <Link
            href="/watch"
            className="inline-flex items-center text-muted-foreground hover:text-primary mb-6 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Videos
          </Link>

          <div className="max-w-5xl mx-auto">
            {/* Video Player */}
            <div className="relative aspect-video overflow-hidden rounded-lg border border-primary/20 shadow-lg mb-6 bg-black flex items-center justify-center">
              <div className="absolute inset-0 flex items-center justify-center">
                <Image
                  src={`/abstract-geometric-shapes.png?key=wjsa5&key=icgf2&height=720&width=1280&query=${video.image}`}
                  alt={video.title}
                  fill
                  className="object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-black/50"></div>
                <Button
                  size="lg"
                  className="rounded-full bg-primary/90 hover:bg-primary z-10 h-20 w-20 flex items-center justify-center"
                >
                  <Play className="h-10 w-10 ml-1" />
                </Button>
              </div>
            </div>

            {/* Video Info */}
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl font-bold mb-4 font-orbitron">{video.title}</h1>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {video.date}
                  </div>
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    {video.views} views
                  </div>
                  <div className="inline-block bg-primary/10 text-primary text-xs px-3 py-1 rounded-full">
                    {video.category}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" className="flex items-center">
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    {video.likes}
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center">
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center">
                    <Bookmark className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                </div>
              </div>
            </div>

            {/* Video Content */}
            <Tabs defaultValue="description" className="mb-12">
              <TabsList>
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="comments">Comments</TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="mt-6">
                <div className="space-y-4">
                  <p>
                    In this video, we break down the revolutionary animation techniques used in Demon Slayer that has
                    set a new standard for the anime industry. We'll analyze the perfect blend of traditional 2D
                    animation with modern 3D and digital effects that made the series visually stunning.
                  </p>
                  <p>We'll cover:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>The unique "flowing" effect used for Tanjiro's water breathing techniques</li>
                    <li>How Ufotable seamlessly integrates CGI with hand-drawn animation</li>
                    <li>Color theory and lighting techniques that enhance emotional impact</li>
                    <li>Comparison with other animation studios and their approaches</li>
                    <li>Behind-the-scenes insights into the production process</li>
                  </ul>
                  <p>
                    Whether you're an anime fan, an aspiring animator, or just appreciate beautiful animation, this
                    analysis will give you a deeper appreciation of the artistry behind Demon Slayer.
                  </p>

                  <div className="flex flex-wrap gap-2 mt-6">
                    <span className="text-sm font-medium mr-2">Tags:</span>
                    {video.tags.map((tag, index) => (
                      <Button key={index} variant="outline" size="sm" className="text-xs">
                        #{tag}
                      </Button>
                    ))}
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="comments" className="mt-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">{comments.length} Comments</h3>
                    <Button variant="outline" size="sm" className="flex items-center">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Add Comment
                    </Button>
                  </div>

                  {/* Comments List */}
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-4 pb-6 border-b border-border">
                      <div className="flex-shrink-0">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden">
                          <Image
                            src={`/abstract-geometric-shapes.png?key=a224l&key=2illo&height=40&width=40&query=${comment.avatar}`}
                            alt={comment.author}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{comment.author}</span>
                          <span className="text-xs text-muted-foreground">{comment.date}</span>
                        </div>
                        <p className="text-sm mb-2">{comment.content}</p>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Button variant="ghost" size="sm" className="h-8 px-2">
                            <ThumbsUp className="h-3 w-3 mr-1" />
                            {comment.likes}
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 px-2">
                            Reply
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Related Videos */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 font-orbitron">Related Videos</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {video.relatedVideos.map((relatedVideo) => (
                <Card
                  key={relatedVideo.id}
                  className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-primary/50"
                >
                  <CardContent className="p-0">
                    <Link href={`/watch/${relatedVideo.id}`}>
                      <div className="relative aspect-video group">
                        <Image
                          src={`/abstract-geometric-shapes.png?key=rkx6g&key=bjgju&height=360&width=640&query=${relatedVideo.image}`}
                          alt={relatedVideo.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/60">
                          <Button size="icon" className="rounded-full bg-primary/90 hover:bg-primary h-10 w-10">
                            <Play className="h-5 w-5 ml-0.5" />
                          </Button>
                        </div>
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {relatedVideo.duration}
                        </div>
                      </div>
                    </Link>
                    <div className="p-4">
                      <Link href={`/watch/${relatedVideo.id}`} className="hover:text-primary transition-colors">
                        <h3 className="font-bold text-sm mb-1 line-clamp-2">{relatedVideo.title}</h3>
                      </Link>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{relatedVideo.views} views</span>
                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          {relatedVideo.category}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
