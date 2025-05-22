import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Flavor Studios – Original Anime That Speaks to the Soul",
  description:
    "Step into Flavor Studios — where powerful anime and heartfelt 3D stories are crafted frame by frame in Blender. Watch. Play. Feel. Support storytelling that leaves a mark on your soul.",
}

export default function HomePage() {
  return (
    <div className="container max-w-5xl mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="mb-16">
        <div className="relative rounded-lg overflow-hidden bg-gradient-to-br from-background via-primary/5 to-background p-8 md:p-12 border border-primary/10 flex flex-col items-center justify-center text-center">
          <div className="relative z-10 max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl mb-6 tracking-tight">
              <span className="gradient-text font-['Orbitron'] tracking-wider font-bold">FLAVOR STUDIOS</span>
            </h1>
            <p className="text-lg md:text-xl mb-8 text-muted-foreground">
              Creating original anime-inspired content and sharing our passion with the world
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
        </div>
      </section>

      {/* Featured Content */}
      <section className="mb-16">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold mb-4 font-orbitron gradient-text">Featured Content</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our latest releases and most popular anime-inspired videos
          </p>
        </div>

        <div className="text-center py-12">
          <div className="bg-card border border-primary/10 rounded-lg p-8">
            <h3 className="text-xl font-bold mb-2 font-orbitron">No featured content available</h3>
            <p className="text-muted-foreground">Check back soon for new videos!</p>
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <Button asChild variant="outline" className="border-primary/50 hover:bg-primary/10">
            <Link href="/watch">
              View All Videos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Latest Blog Posts */}
      <section className="mb-16">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold mb-4 font-orbitron gradient-text">Latest from Our Blog</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Dive into our collection of articles, reviews, and insights about anime
          </p>
        </div>

        <div className="text-center py-12">
          <div className="bg-card border border-primary/10 rounded-lg p-8">
            <h3 className="text-xl font-bold mb-2 font-orbitron">No blog posts available</h3>
            <p className="text-muted-foreground">Check back soon for new content!</p>
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <Button asChild variant="outline" className="border-primary/50 hover:bg-primary/10">
            <Link href="/blog">
              Visit Our Blog
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* CTA Section */}
      <section className="rounded-lg overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/5 p-8 border border-primary/10">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4 font-orbitron">Join Our Community</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
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
