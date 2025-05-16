import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Calendar, User, Clock, Share2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getPostData } from "@/lib/posts"

interface BlogPostPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = await getPostData(params.slug)

  return {
    title: `${post.title} – Flavor Studios Blog`,
    description: post.summary || "A new perspective from the world of Flavor Studios.",
    openGraph: {
      title: `${post.title} – Flavor Studios Blog`,
      description: post.summary || "A new perspective from the world of Flavor Studios.",
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
    },
  }
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = params

  // In a real app, you would fetch the blog post data based on the slug
  // For this example, we'll use hardcoded data
  const post = {
    title: "The Evolution of Anime Art Styles",
    excerpt: "Exploring how Japanese animation art styles have changed over the decades and influenced global media.",
    category: "Analysis",
    date: "May 15, 2023",
    author: "Alex Chen",
    readTime: "8 min read",
    image: "anime%20art%20styles%20evolution%20detailed",
    content: `
      <p class="mb-4">Anime, as we know it today, has undergone significant transformations since its inception. From the early days of black and white animation to the digital masterpieces of the present, the evolution of anime art styles tells a fascinating story of artistic innovation, cultural influences, and technological advancements.</p>
      
      <h2 class="text-2xl font-bold mt-8 mb-4 font-orbitron">The Early Days: 1960s-1970s</h2>
      
      <p class="mb-4">The 1960s marked the beginning of what we now recognize as anime. Osamu Tezuka, often called the "God of Manga," revolutionized Japanese animation with works like "Astro Boy" (1963). The art style of this era was characterized by:</p>
      
      <ul class="list-disc pl-6 mb-4 space-y-2">
        <li>Simple, rounded character designs</li>
        <li>Limited animation techniques to save on production costs</li>
        <li>Large, expressive eyes (a Tezuka trademark inspired by Disney)</li>
        <li>Basic color palettes</li>
      </ul>
      
      <p class="mb-4">The economic constraints of the time meant that creators had to be innovative in their approach, often using stylistic shortcuts that would later become defining characteristics of anime as an art form.</p>
      
      <h2 class="text-2xl font-bold mt-8 mb-4 font-orbitron">The Experimental Period: 1980s</h2>
      
      <p class="mb-4">The 1980s saw an explosion of creativity in anime art styles. With increased budgets and technological advancements, studios began experimenting with more complex designs and animation techniques. This era gave us:</p>
      
      <ul class="list-disc pl-6 mb-4 space-y-2">
        <li>More detailed character designs with complex hairstyles and costumes</li>
        <li>Greater variation in body proportions and facial features</li>
        <li>Enhanced color depth and lighting effects</li>
        <li>More fluid animation, especially in action sequences</li>
      </ul>
      
      <p class="mb-4">Iconic works like "Akira" (1988) showcased unprecedented attention to detail and fluid motion, setting new standards for animation quality worldwide.</p>
      
      <h2 class="text-2xl font-bold mt-8 mb-4 font-orbitron">The Digital Revolution: 1990s-2000s</h2>
      
      <p class="mb-4">The introduction of computer technology in animation production during the 1990s and early 2000s transformed anime art styles once again. This period saw:</p>
      
      <ul class="list-disc pl-6 mb-4 space-y-2">
        <li>Integration of CGI elements with traditional 2D animation</li>
        <li>More complex lighting and special effects</li>
        <li>Experimentation with unique visual styles (e.g., the minimalist approach of "Serial Experiments Lain")</li>
        <li>Greater consistency in character designs across episodes</li>
      </ul>
      
      <p class="mb-4">Studios like Gainax and Production I.G pushed boundaries with visually stunning works that combined traditional techniques with digital enhancements.</p>
      
      <h2 class="text-2xl font-bold mt-8 mb-4 font-orbitron">Contemporary Anime: 2010s-Present</h2>
      
      <p class="mb-4">Today's anime landscape features unprecedented diversity in art styles, reflecting both technological capabilities and artistic choices. Modern anime is characterized by:</p>
      
      <ul class="list-disc pl-6 mb-4 space-y-2">
        <li>High-quality digital animation with seamless CGI integration</li>
        <li>Diverse approaches to character design, from hyperrealistic to extremely stylized</li>
        <li>Dynamic camera work and perspective</li>
        <li>Rich, complex color grading and lighting</li>
        <li>Experimental approaches that mix different stylistic elements</li>
      </ul>
      
      <p class="mb-4">Studios like Kyoto Animation, MAPPA, and ufotable have developed distinctive visual identities, showcasing the incredible range possible within anime as a medium.</p>
      
      <h2 class="text-2xl font-bold mt-8 mb-4 font-orbitron">Global Influence and Cross-Pollination</h2>
      
      <p class="mb-4">Perhaps the most interesting development in recent years has been the two-way exchange between anime and global animation styles. Western animators draw inspiration from anime techniques, while Japanese creators incorporate elements from global animation trends. This cross-pollination has led to fascinating hybrid styles that continue to push the boundaries of visual storytelling.</p>
      
      <p class="mb-4">As we look to the future, emerging technologies like AI-assisted animation and virtual reality promise to open new frontiers for anime art styles. One thing is certain: the evolution will continue, building on a rich history while embracing new possibilities.</p>
    `,
    relatedPosts: [
      {
        id: "studio-ghibli-magic",
        title: "The Magic Behind Studio Ghibli's Animation",
        excerpt: "A deep dive into the unique animation techniques that make Studio Ghibli films so captivating.",
        category: "Behind the Scenes",
        date: "April 30, 2023",
        image: "studio%20ghibli%20animation%20techniques",
      },
      {
        id: "anime-influence-western-cinema",
        title: "How Anime Has Influenced Western Cinema",
        excerpt: "From 'The Matrix' to 'Inception': The undeniable impact of anime on Hollywood's visual storytelling.",
        category: "Analysis",
        date: "July 22, 2023",
        image: "anime%20influence%20on%20western%20cinema",
      },
    ],
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background to-background z-0"></div>
        <div className="container relative z-10 mx-auto px-4">
          <Link
            href="/blog"
            className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Link>

          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <span className="inline-block bg-primary/10 text-primary text-sm px-3 py-1 rounded-full mb-4">
                {post.category}
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-orbitron tracking-tight">{post.title}</h1>
            </div>

            <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-8">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                {post.author}
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {post.date}
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {post.readTime}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Content */}
      <section className="py-8 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="relative aspect-[16/9] rounded-lg overflow-hidden mb-8 shadow-lg">
              <Image
                src={`/abstract-geometric-shapes.png?key=uce0t&key=1heqp&height=720&width=1280&query=${post.image}`}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>

            <div
              className="prose prose-lg dark:prose-invert max-w-none mb-12"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Post Footer */}
            <div className="border-t border-border pt-8 mt-12">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" className="flex items-center">
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">Tags:</span>
                  <Button variant="outline" size="sm">
                    anime
                  </Button>
                  <Button variant="outline" size="sm">
                    art
                  </Button>
                  <Button variant="outline" size="sm">
                    history
                  </Button>
                </div>
              </div>
            </div>

            {/* Related Posts */}
            <div className="mt-16">
              <h3 className="text-2xl font-bold mb-8 font-orbitron">Related Articles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {post.relatedPosts.map((relatedPost) => (
                  <Card
                    key={relatedPost.id}
                    className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-primary/50"
                  >
                    <CardContent className="p-0">
                      <Link href={`/blog/${relatedPost.id}`}>
                        <div className="relative aspect-[4/3]">
                          <Image
                            src={`/abstract-geometric-shapes.png?key=iszy3&key=wlk2b&height=400&width=600&query=${relatedPost.image}`}
                            alt={relatedPost.title}
                            fill
                            className="object-cover transition-transform duration-500 hover:scale-105"
                          />
                        </div>
                      </Link>
                      <div className="p-5">
                        <div className="mb-3 flex justify-between items-center">
                          <span className="inline-block bg-primary/10 text-primary text-xs px-3 py-1 rounded-full">
                            {relatedPost.category}
                          </span>
                          <span className="text-xs text-muted-foreground">{relatedPost.date}</span>
                        </div>
                        <Link href={`/blog/${relatedPost.id}`} className="hover:text-primary transition-colors">
                          <h3 className="font-bold text-lg mb-2 font-orbitron">{relatedPost.title}</h3>
                        </Link>
                        <p className="text-muted-foreground text-sm line-clamp-2 mb-4">{relatedPost.excerpt}</p>
                        <Link
                          href={`/blog/${relatedPost.id}`}
                          className="text-primary hover:text-primary/80 text-sm font-medium inline-flex items-center"
                        >
                          Read More
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
