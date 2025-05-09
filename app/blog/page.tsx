"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Search, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Blog posts data
const blogPosts = [
  {
    id: 1,
    title: "The Art of Character Design: Creating Memorable Anime Characters",
    excerpt: "Explore the principles and techniques behind creating anime characters that resonate with audiences.",
    image: "/placeholder.svg?height=300&width=600&text=Character+Design",
    date: "May 15, 2023",
    category: "Art",
    author: "Akira Tanaka",
    authorImage: "/placeholder.svg?height=100&width=100&text=AT",
    readTime: "8 min read",
  },
  {
    id: 2,
    title: "From Storyboard to Screen: The Animation Process Explained",
    excerpt: "A behind-the-scenes look at how we bring our stories to life through animation.",
    image: "/placeholder.svg?height=300&width=600&text=Animation+Process",
    date: "April 22, 2023",
    category: "Production",
    author: "Mei Lin",
    authorImage: "/placeholder.svg?height=100&width=100&text=ML",
    readTime: "12 min read",
  },
  {
    id: 3,
    title: "The Evolution of Anime: Past, Present, and Future Trends",
    excerpt: "Examining how anime has evolved over the decades and where it might be heading next.",
    image: "/placeholder.svg?height=300&width=600&text=Anime+Evolution",
    date: "March 10, 2023",
    category: "Industry",
    author: "Hiroshi Nakamura",
    authorImage: "/placeholder.svg?height=100&width=100&text=HN",
    readTime: "15 min read",
  },
  {
    id: 4,
    title: "Color Theory in Anime: How Palette Choices Affect Storytelling",
    excerpt: "Understanding the psychological impact of color choices in anime and how they enhance narrative.",
    image: "/placeholder.svg?height=300&width=600&text=Color+Theory",
    date: "February 28, 2023",
    category: "Art",
    author: "Sakura Yamamoto",
    authorImage: "/placeholder.svg?height=100&width=100&text=SY",
    readTime: "10 min read",
  },
  {
    id: 5,
    title: "Voice Acting for Anime: Finding the Perfect Voice for Characters",
    excerpt: "The process of casting and directing voice actors to bring animated characters to life.",
    image: "/placeholder.svg?height=300&width=600&text=Voice+Acting",
    date: "January 15, 2023",
    category: "Production",
    author: "Takeshi Kondo",
    authorImage: "/placeholder.svg?height=100&width=100&text=TK",
    readTime: "9 min read",
  },
  {
    id: 6,
    title: "The Impact of Streaming Platforms on Anime Distribution",
    excerpt: "How digital platforms have changed the way anime reaches global audiences.",
    image: "/placeholder.svg?height=300&width=600&text=Streaming+Impact",
    date: "December 5, 2022",
    category: "Industry",
    author: "Yuki Tanaka",
    authorImage: "/placeholder.svg?height=100&width=100&text=YT",
    readTime: "11 min read",
  },
]

const categories = ["All", "Art", "Production", "Industry", "Technology", "Culture"]

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("All")

  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = activeCategory === "All" || post.category === activeCategory

    return matchesSearch && matchesCategory
  })

  return (
    <div className="relative pt-16">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-background"></div>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"></div>
        </div>

        <div className="container relative z-10 mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-heading mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
          >
            <span className="heading-gradient">Flavor Studios Blog</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl"
          >
            Insights, tutorials, and updates from the world of anime and animation
          </motion.p>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search articles..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Tabs defaultValue="All" value={activeCategory} onValueChange={setActiveCategory}>
              <TabsList className="h-auto">
                {categories.map((category) => (
                  <TabsTrigger key={category} value={category} className="text-xs sm:text-sm">
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {filteredPosts.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
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
                      <div className="mb-4 flex items-center justify-between">
                        <Badge variant="outline">{post.category}</Badge>
                        <span className="text-xs text-muted-foreground">{post.date}</span>
                      </div>
                      <h3 className="font-heading mb-2 text-xl font-bold">{post.title}</h3>
                      <p className="mb-6 flex-1 text-sm text-muted-foreground">{post.excerpt}</p>
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="relative h-8 w-8 overflow-hidden rounded-full">
                            <Image
                              src={post.authorImage || "/placeholder.svg"}
                              alt={post.author}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <p className="text-xs font-medium">{post.author}</p>
                            <p className="text-xs text-muted-foreground">{post.readTime}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="w-fit" asChild>
                          <Link href={`/blog/${post.id}`}>
                            Read <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-center text-lg text-muted-foreground">
                No articles found matching your search criteria.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchQuery("")
                  setActiveCategory("All")
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="rounded-lg border bg-card p-8 md:p-12">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-heading mb-4 text-2xl font-bold tracking-tight sm:text-3xl">
                Subscribe to Our <span className="heading-gradient">Newsletter</span>
              </h2>
              <p className="mb-6 text-muted-foreground">
                Stay updated with the latest articles, tutorials, and news from Flavor Studios.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Input type="email" placeholder="Enter your email" className="flex-1" />
                <Button>Subscribe</Button>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                By subscribing, you agree to our{" "}
                <Link href="/privacy-policy" className="underline hover:text-primary">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
