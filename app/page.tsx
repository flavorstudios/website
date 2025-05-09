"use client"

import { useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useScroll, useTransform } from "framer-motion"
import { ArrowRight, Play, Star, Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Featured anime shows data
const featuredShows = [
  {
    id: 1,
    title: "Cosmic Dreamers",
    image: "/placeholder.svg?height=500&width=350&text=Cosmic+Dreamers",
    category: "Sci-Fi",
    rating: 4.8,
    episodes: 12,
    status: "Ongoing",
  },
  {
    id: 2,
    title: "Spirit Chronicles",
    image: "/placeholder.svg?height=500&width=350&text=Spirit+Chronicles",
    category: "Fantasy",
    rating: 4.6,
    episodes: 24,
    status: "Completed",
  },
  {
    id: 3,
    title: "Neon Shadows",
    image: "/placeholder.svg?height=500&width=350&text=Neon+Shadows",
    category: "Cyberpunk",
    rating: 4.9,
    episodes: 8,
    status: "Ongoing",
  },
  {
    id: 4,
    title: "Eternal Bonds",
    image: "/placeholder.svg?height=500&width=350&text=Eternal+Bonds",
    category: "Drama",
    rating: 4.7,
    episodes: 16,
    status: "Completed",
  },
]

// Blog posts data
const blogPosts = [
  {
    id: 1,
    title: "The Art of Character Design: Creating Memorable Anime Characters",
    excerpt: "Explore the principles and techniques behind creating anime characters that resonate with audiences.",
    image: "/placeholder.svg?height=300&width=600&text=Character+Design",
    date: "May 15, 2023",
    category: "Art",
  },
  {
    id: 2,
    title: "From Storyboard to Screen: The Animation Process Explained",
    excerpt: "A behind-the-scenes look at how we bring our stories to life through animation.",
    image: "/placeholder.svg?height=300&width=600&text=Animation+Process",
    date: "April 22, 2023",
    category: "Production",
  },
  {
    id: 3,
    title: "The Evolution of Anime: Past, Present, and Future Trends",
    excerpt: "Examining how anime has evolved over the decades and where it might be heading next.",
    image: "/placeholder.svg?height=300&width=600&text=Anime+Evolution",
    date: "March 10, 2023",
    category: "Industry",
  },
]

export default function HomePage() {
  const targetRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1])
  const y = useTransform(scrollYProgress, [0, 0.5], [50, 0])

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-16">
        {/* Background Animation */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/80 to-background"></div>
          <div className="anime-grid absolute inset-0 opacity-30"></div>
        </div>

        <div className="container relative z-10 px-4 py-24 md:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Badge className="mb-4 animate-pulse">Now Streaming</Badge>
              <h1 className="font-heading mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                <span className="heading-gradient">Bringing Anime</span>
                <br />
                Dreams to Life
              </h1>
              <p className="mb-8 mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
                An indie anime studio creating original animations and stories that inspire, entertain, and connect with
                audiences worldwide.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" asChild>
                  <Link href="/watch">
                    Watch Now <Play className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/about">Discover Our Story</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="flex flex-col items-center">
            <span className="text-sm text-muted-foreground">Scroll to explore</span>
            <div className="mt-2 h-10 w-6 rounded-full border border-muted p-1">
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
                className="h-2 w-full rounded-full bg-primary"
              />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Featured Shows Section */}
      <section ref={targetRef} className="py-24">
        <div className="container px-4 md:px-6">
          <motion.div style={{ opacity, y }} className="mb-12 text-center">
            <h2 className="font-heading mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Featured <span className="heading-gradient">Animations</span>
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Explore our latest and most popular original anime series and films
            </p>
          </motion.div>

          <Tabs defaultValue="all" className="mb-12">
            <TabsList className="mx-auto">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="series">Series</TabsTrigger>
              <TabsTrigger value="films">Films</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredShows.map((show, index) => (
              <motion.div
                key={show.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="group anime-card overflow-hidden">
                  <div className="relative aspect-[2/3] overflow-hidden">
                    <Image
                      src={show.image || "/placeholder.svg"}
                      alt={show.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-60"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <Badge variant="secondary" className="mb-2">
                        {show.category}
                      </Badge>
                      <h3 className="font-heading text-lg font-bold">{show.title}</h3>
                      <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Star className="mr-1 h-3.5 w-3.5 text-yellow-500" />
                          {show.rating}
                        </div>
                        <div className="flex items-center">
                          <Clock className="mr-1 h-3.5 w-3.5" />
                          {show.episodes} ep
                        </div>
                        <div className="flex items-center">
                          <Badge variant={show.status === "Ongoing" ? "default" : "outline"} className="text-xs">
                            {show.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <Button variant="ghost" size="sm" className="w-full" asChild>
                      <Link href={`/watch/${show.id}`}>
                        Watch Now <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button size="lg" variant="outline" asChild>
              <Link href="/watch">View All Shows</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Studio Introduction */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="anime-dots absolute inset-0 opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background"></div>
        </div>

        <div className="container relative z-10 px-4 md:px-6">
          <div className="mx-auto max-w-3xl">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
            >
              <h2 className="font-heading mb-6 text-3xl font-bold tracking-tight sm:text-4xl text-center">
                Creating <span className="heading-gradient">Unforgettable</span> Stories
              </h2>
              <p className="mb-6 text-muted-foreground text-center">
                At Flavor Studios, we believe stories shape the soul. Born from a dream fueled by resilience and
                passion, our studio creates rich, emotionally grounded narratives that transcend age and culture.
              </p>
              <p className="mb-8 text-muted-foreground text-center">
                Every frame we produce is a step toward a future where creativity becomes legacy and passion turns into
                purpose.
              </p>
              <div className="flex flex-wrap justify-center gap-8 mt-8">
                <div>
                  <div className="font-heading text-3xl font-bold heading-gradient text-center">10+</div>
                  <p className="text-sm text-muted-foreground">Original Series</p>
                </div>
                <div>
                  <div className="font-heading text-3xl font-bold heading-gradient text-center">50+</div>
                  <p className="text-sm text-muted-foreground">Episodes Created</p>
                </div>
                <div>
                  <div className="font-heading text-3xl font-bold heading-gradient text-center">5+</div>
                  <p className="text-sm text-muted-foreground">Years of Experience</p>
                </div>
              </div>
              <div className="mt-8 text-center">
                <Button asChild>
                  <Link href="/about">About Our Studio</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Latest Blog Posts */}
      <section className="py-24">
        <div className="container px-4 md:px-6">
          <div className="mb-12 text-center">
            <h2 className="font-heading mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Latest from the <span className="heading-gradient">Blog</span>
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Insights, tutorials, and updates from the world of anime and animation
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {blogPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="anime-card h-full overflow-hidden">
                  <div className="relative aspect-video overflow-hidden">
                    <Image
                      src={post.image || "/placeholder.svg"}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <CardContent className="flex h-full flex-col p-6">
                    <div className="mb-4 flex items-center gap-2">
                      <Badge variant="outline">{post.category}</Badge>
                      <span className="text-xs text-muted-foreground">{post.date}</span>
                    </div>
                    <h3 className="font-heading mb-2 text-xl font-bold">{post.title}</h3>
                    <p className="mb-6 flex-1 text-sm text-muted-foreground">{post.excerpt}</p>
                    <Button variant="ghost" size="sm" className="w-fit" asChild>
                      <Link href={`/blog/${post.id}`}>
                        Read More <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button size="lg" variant="outline" asChild>
              <Link href="/blog">View All Posts</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="animated-gradient absolute inset-0 opacity-10"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background"></div>
        </div>

        <div className="container relative z-10 px-4 md:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
            >
              <h2 className="font-heading mb-6 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Ready to Experience the World of <span className="heading-gradient">Flavor Studios</span>?
              </h2>
              <p className="mb-8 text-muted-foreground md:text-lg">
                Join our community and be part of our creative journey. Watch our animations, play our games, and stay
                updated with the latest news.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" asChild>
                  <Link href="/watch">
                    Start Watching <Play className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/contact">Contact Us</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
