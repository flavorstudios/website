import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

export const metadata = {
  title: "Flavor Blog – Honest Anime Reviews, News & Deep Dives",
  description:
    "Read anime insights, story breakdowns, and creative reflections from Flavor Studios. Thoughtful, heartfelt blogs for fans and dreamers.",
}

export default function BlogPage() {
  const blogPosts: any[] = []

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background to-background z-0"></div>
        <div className="container relative z-10 mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-orbitron tracking-tight">
              <span className="gradient-text">Anime Blog</span>
            </h1>
            <p className="text-xl max-w-3xl mx-auto mb-8 text-muted-foreground">
              Dive into our collection of articles, reviews, and insights about the world of anime.
            </p>
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search blog posts..." className="pl-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.length > 0 ? (
              blogPosts.map((post) => (
                <Card
                  key={post.id}
                  className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-primary/50"
                >
                  <CardContent className="p-0">
                    <Link href={`/blog/${post.id}`}>
                      <div className="relative aspect-[4/3]">
                        <Image
                          src={`/abstract-geometric-shapes.png?key=ju60w&height=400&width=600&query=${post.image}`}
                          alt={post.title}
                          fill
                          className="object-cover transition-transform duration-500 hover:scale-105"
                        />
                      </div>
                    </Link>
                    <div className="p-5">
                      <div className="mb-3 flex justify-between items-center">
                        <span className="inline-block bg-primary/10 text-primary text-xs px-3 py-1 rounded-full">
                          {post.category}
                        </span>
                        <span className="text-xs text-muted-foreground">{post.date}</span>
                      </div>
                      <Link href={`/blog/${post.id}`} className="hover:text-primary transition-colors">
                        <h3 className="font-bold text-lg mb-2 font-orbitron">{post.title}</h3>
                      </Link>
                      <p className="text-muted-foreground text-sm line-clamp-3 mb-4">{post.excerpt}</p>
                      <Link
                        href={`/blog/${post.id}`}
                        className="text-primary hover:text-primary/80 text-sm font-medium inline-flex items-center"
                      >
                        Read More
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12">
                <div className="bg-card border border-primary/10 rounded-lg p-8">
                  <h3 className="text-xl font-bold mb-2 font-orbitron">No posts available</h3>
                  <p className="text-muted-foreground">Check back soon for new content!</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-center mt-12">
            <Button className="bg-primary hover:bg-primary/90" disabled={blogPosts.length === 0}>
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
