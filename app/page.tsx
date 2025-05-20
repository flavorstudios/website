import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Play, Clock, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export const metadata = {
  title: "Flavor Studios – Original Anime That Speaks to the Soul",
  description:
    "Step into Flavor Studios — where powerful anime and heartfelt 3D stories are crafted frame by frame in Blender. Watch. Play. Feel. Support storytelling that leaves a mark on your soul.",
}

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">FLAVOR STUDIOS</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-10">
            Creating original anime-inspired content and sharing our passion with the world
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white">
              <Link href="/watch">
                Watch Our Content
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary/50 hover:bg-primary/10">
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Content */}
      <section className="py-16 md:py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-orbitron gradient-text">Featured Content</h2>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Explore our latest releases and most popular anime-inspired videos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <Card
                key={item}
                className="overflow-hidden bg-background/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-primary/50"
              >
                <CardContent className="p-0">
                  <div className="relative aspect-video group">
                    <Image
                      src={`/placeholder-w373e.png?key=henm6&height=360&width=640&query=anime%20video%20thumbnail%20${item}`}
                      alt={`Featured video ${item}`}
                      width={640}
                      height={360}
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      priority={item === 1}
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50">
                      <Button size="icon" className="rounded-full bg-primary hover:bg-primary/90 h-14 w-14">
                        <Play className="h-6 w-6 ml-1" />
                      </Button>
                    </div>
                    <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      10:45
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-lg mb-2 font-orbitron">Top 10 Anime Openings</h3>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>24K views</span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        4.9
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-center mt-10">
            <Button asChild variant="outline" className="hover:bg-primary/10">
              <Link href="/watch">
                View All Videos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Latest Blog Posts */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-orbitron gradient-text">Latest from Our Blog</h2>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Dive into our collection of articles, reviews, and insights about anime
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <Card
                key={item}
                className="overflow-hidden bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-primary/50"
              >
                <CardContent className="p-0">
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={`/placeholder-vb14m.png?key=3vopt&height=400&width=600&query=anime%20blog%20post%20${item}`}
                      alt={`Blog post ${item}`}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority={item === 1}
                    />
                  </div>
                  <div className="p-5">
                    <div className="mb-3">
                      <span className="inline-block bg-primary/10 text-primary text-xs px-3 py-1 rounded-full">
                        Anime Analysis
                      </span>
                      <span className="text-xs text-muted-foreground ml-2">May 15, 2023</span>
                    </div>
                    <h3 className="font-bold text-lg mb-2 font-orbitron">The Evolution of Anime Art Styles</h3>
                    <p className="text-muted-foreground text-sm line-clamp-2">
                      Exploring how Japanese animation art styles have changed over the decades and influenced global
                      media.
                    </p>
                    <Link
                      href="/blog/evolution-of-anime-art-styles"
                      className="text-primary hover:text-primary/80 text-sm font-medium mt-4 inline-flex items-center"
                    >
                      Read More
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-center mt-10">
            <Button asChild variant="outline" className="hover:bg-primary/10">
              <Link href="/blog">
                Visit Our Blog
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary/5 border-y border-primary/20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 font-orbitron">Join Our Community</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            Get exclusive content, behind-the-scenes access, and connect with other anime fans like you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
              <Link href="/support">Support Our Work</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary/50 hover:bg-primary/10">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
