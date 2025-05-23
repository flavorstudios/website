import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export const metadata = {
  title: "Flavor Blog – Honest Anime Reviews, News & Deep Dives",
  description:
    "Read anime insights, story breakdowns, and creative reflections from Flavor Studios. Thoughtful, heartfelt blogs for fans and dreamers.",
}

export default function BlogPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section - Left-aligned like Support page */}
      <section className="relative py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background"></div>
        <div className="absolute inset-0 bg-grid-small-white/[0.02] -z-10"></div>
        <div className="container relative z-10 mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm text-primary mb-6">
              <span className="mr-1">✨</span> Independent Animation Studio
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 font-orbitron tracking-tight text-left">
              Anime <span className="text-primary">Blog</span>
            </h1>

            <p className="text-xl mb-6 text-muted-foreground leading-relaxed text-left">
              Dive into our collection of articles, reviews, and insights about the world of anime.
            </p>

            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search blog posts..." className="pl-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12">
            <div className="bg-card border border-primary/10 rounded-lg p-8">
              <h3 className="text-xl font-bold mb-2 font-orbitron">No posts available</h3>
              <p className="text-muted-foreground">Check back soon for new content!</p>
            </div>
          </div>

          <div className="flex justify-center mt-12">
            <Button className="bg-primary hover:bg-primary/90" disabled={true}>
              Load More Posts
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 md:py-24 bg-primary/5 border-y border-primary/20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 font-orbitron">Stay Updated</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Subscribe to our newsletter to receive the latest blog posts, anime news, and exclusive content directly
              to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input placeholder="Your email address" className="flex-grow" />
              <Button className="bg-primary hover:bg-primary/90">Subscribe</Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
