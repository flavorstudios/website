import Link from "next/link"
import { Search, Play, Youtube } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export const metadata = {
  title: "Watch Original Anime – Blender-Powered Brilliance | Flavor Studios",
  description:
    "Stream handcrafted anime series and shorts from Flavor Studios. Each frame is built in Blender, every scene filled with soul.",
}

export default function WatchPage() {
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

      {/* Featured Video */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto overflow-hidden rounded-lg border border-primary/20 shadow-lg animate-glow">
            <div className="relative aspect-video group bg-card">
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-primary/10 rounded-full p-4 mb-4">
                  <Play className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold font-orbitron mb-2">No Featured Video Available</h3>
                <p className="text-muted-foreground max-w-md">
                  Our featured content will appear here. Check back soon for new videos!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Grid */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-10 font-orbitron">Latest Videos</h2>

          <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12">
            <div className="bg-card border border-primary/10 rounded-lg p-8">
              <h3 className="text-xl font-bold mb-2 font-orbitron">No videos available</h3>
              <p className="text-muted-foreground">Check back soon for new content!</p>
            </div>
          </div>

          <div className="flex justify-center mt-12">
            <Button className="bg-primary hover:bg-primary/90" disabled={true}>
              Load More Videos
            </Button>
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
