"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Play, Star, Clock, Filter, Search, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

// Anime shows data
const animeShows = [
  {
    id: 1,
    title: "Cosmic Dreamers",
    image: "/placeholder.svg?height=500&width=350&text=Cosmic+Dreamers",
    category: "Sci-Fi",
    rating: 4.8,
    episodes: 12,
    status: "Ongoing",
    year: 2023,
    description:
      "A group of friends discover they can enter and manipulate dreams, only to find a cosmic entity threatening to turn dreams into nightmares.",
  },
  {
    id: 2,
    title: "Spirit Chronicles",
    image: "/placeholder.svg?height=500&width=350&text=Spirit+Chronicles",
    category: "Fantasy",
    rating: 4.6,
    episodes: 24,
    status: "Completed",
    year: 2022,
    description:
      "In a world where spirits and humans coexist, a young spirit medium discovers her destiny to bridge the two worlds and prevent an ancient conflict.",
  },
  {
    id: 3,
    title: "Neon Shadows",
    image: "/placeholder.svg?height=500&width=350&text=Neon+Shadows",
    category: "Cyberpunk",
    rating: 4.9,
    episodes: 8,
    status: "Ongoing",
    year: 2023,
    description:
      "In a dystopian future dominated by corporations, a hacker with cybernetic enhancements fights against the system while uncovering a conspiracy.",
  },
  {
    id: 4,
    title: "Eternal Bonds",
    image: "/placeholder.svg?height=500&width=350&text=Eternal+Bonds",
    category: "Drama",
    rating: 4.7,
    episodes: 16,
    status: "Completed",
    year: 2021,
    description:
      "A touching story of friendship, love, and sacrifice spanning multiple generations connected by a mysterious artifact.",
  },
  {
    id: 5,
    title: "Samurai's Path",
    image: "/placeholder.svg?height=500&width=350&text=Samurai's+Path",
    category: "Historical",
    rating: 4.5,
    episodes: 20,
    status: "Completed",
    year: 2020,
    description:
      "A wandering samurai seeks redemption while protecting the innocent in feudal Japan, confronting both human adversaries and supernatural threats.",
  },
  {
    id: 6,
    title: "Mecha Alliance",
    image: "/placeholder.svg?height=500&width=350&text=Mecha+Alliance",
    category: "Mecha",
    rating: 4.4,
    episodes: 26,
    status: "Completed",
    year: 2019,
    description:
      "Pilots of advanced mechanical suits must set aside their differences to defend Earth against an alien invasion.",
  },
  {
    id: 7,
    title: "Magical Academy",
    image: "/placeholder.svg?height=500&width=350&text=Magical+Academy",
    category: "Fantasy",
    rating: 4.3,
    episodes: 13,
    status: "Ongoing",
    year: 2023,
    description:
      "Students at an elite academy learn to harness magical abilities while uncovering dark secrets about the school's history.",
  },
  {
    id: 8,
    title: "Ocean Legends",
    image: "/placeholder.svg?height=500&width=350&text=Ocean+Legends",
    category: "Adventure",
    rating: 4.7,
    episodes: 18,
    status: "Ongoing",
    year: 2022,
    description:
      "A crew of explorers searches for legendary treasures in the depths of a mysterious ocean world filled with wonders and dangers.",
  },
]

const categories = ["All", "Sci-Fi", "Fantasy", "Cyberpunk", "Drama", "Historical", "Mecha", "Adventure"]
const statuses = ["All", "Ongoing", "Completed"]
const years = ["All", "2023", "2022", "2021", "2020", "2019"]

export default function WatchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("All")
  const [activeStatus, setActiveStatus] = useState("All")
  const [activeYear, setActiveYear] = useState("All")
  const [ratingFilter, setRatingFilter] = useState([0])

  const filteredShows = animeShows.filter((show) => {
    const matchesSearch =
      show.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      show.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = activeCategory === "All" || show.category === activeCategory
    const matchesStatus = activeStatus === "All" || show.status === activeStatus
    const matchesYear = activeYear === "All" || show.year.toString() === activeYear
    const matchesRating = show.rating >= ratingFilter[0]

    return matchesSearch && matchesCategory && matchesStatus && matchesYear && matchesRating
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
            <span className="heading-gradient">Watch Our Anime</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl"
          >
            Explore our original anime series and films
          </motion.p>
        </div>
      </section>

      {/* Featured Show */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <Card className="anime-card overflow-hidden">
              <CardContent className="p-8">
                <div>
                  <Badge className="mb-2">Featured</Badge>
                  <h2 className="font-heading mb-2 text-2xl font-bold md:text-4xl">Cosmic Dreamers</h2>
                  <div className="mb-4 flex flex-wrap gap-4">
                    <Badge variant="outline">Sci-Fi</Badge>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">4.8</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">12 Episodes</span>
                    </div>
                  </div>
                  <p className="mb-6 max-w-3xl text-muted-foreground">
                    A group of friends discover they can enter and manipulate dreams, only to find a cosmic entity
                    threatening to turn dreams into nightmares.
                  </p>
                  <Button asChild>
                    <Link href="/watch/1">
                      Watch Now <Play className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
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
                placeholder="Search anime..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <Tabs
                defaultValue="All"
                value={activeCategory}
                onValueChange={setActiveCategory}
                className="hidden md:block"
              >
                <TabsList className="h-auto">
                  {categories.slice(0, 5).map((category) => (
                    <TabsTrigger key={category} value={category} className="text-xs sm:text-sm">
                      {category}
                    </TabsTrigger>
                  ))}
                  <Select value={activeCategory} onValueChange={setActiveCategory}>
                    <SelectTrigger className="h-8 w-[110px]">
                      <SelectValue placeholder="More..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.slice(5).map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TabsList>
              </Tabs>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="md:hidden">
                    <Filter className="mr-2 h-4 w-4" /> Filters
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                    <SheetDescription>Filter anime by category, status, year, and rating.</SheetDescription>
                  </SheetHeader>
                  <div className="py-6 space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Category</h3>
                      <Select value={activeCategory} onValueChange={setActiveCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Status</h3>
                      <Select value={activeStatus} onValueChange={setActiveStatus}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {statuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Year</h3>
                      <Select value={activeYear} onValueChange={setActiveYear}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          {years.map((year) => (
                            <SelectItem key={year} value={year}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">Minimum Rating</h3>
                        <span className="text-sm text-muted-foreground">{ratingFilter[0]}/5</span>
                      </div>
                      <Slider
                        defaultValue={[0]}
                        max={5}
                        step={0.1}
                        value={ratingFilter}
                        onValueChange={setRatingFilter}
                      />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              <div className="hidden md:flex items-center gap-2">
                <Select value={activeStatus} onValueChange={setActiveStatus}>
                  <SelectTrigger className="h-8 w-[120px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={activeYear} onValueChange={activeYear}>
                  <SelectTrigger className="h-8 w-[100px]">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Anime Shows */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {filteredShows.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {filteredShows.map((show, index) => (
                <motion.div
                  key={show.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
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
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-center text-lg text-muted-foreground">No anime found matching your search criteria.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchQuery("")
                  setActiveCategory("All")
                  setActiveStatus("All")
                  setActiveYear("All")
                  setRatingFilter([0])
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
            >
              <h2 className="font-heading mb-6 text-3xl font-bold tracking-tight sm:text-4xl">
                Want to <span className="heading-gradient">Stay Updated</span>?
              </h2>
              <p className="mb-8 text-muted-foreground md:text-lg">
                Subscribe to our newsletter to get notified about new releases, episodes, and exclusive content.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Input type="email" placeholder="Enter your email" className="max-w-md" />
                <Button>Subscribe</Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
