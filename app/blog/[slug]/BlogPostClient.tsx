"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, Calendar, User, Clock, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

// Mock blog post data - in a real app, this would come from an API or CMS
const blogPosts = [
  {
    id: 1,
    slug: "character-design-art",
    title: "The Art of Character Design: Creating Memorable Anime Characters",
    summary: "Explore the principles and techniques behind creating anime characters that resonate with audiences.",
    content: `
      <p>Character design is at the heart of any successful animation project. A well-designed character can become iconic, resonating with audiences and standing the test of time. At Flavor Studios, we approach character design as a blend of art and psychology, focusing on creating characters that are not only visually appealing but also emotionally engaging.</p>
      
      <h2>Start with Personality</h2>
      <p>Before we sketch a single line, we develop a deep understanding of who our characters are. What motivates them? What are their fears, hopes, and dreams? What makes them unique? By answering these questions, we create a foundation that informs every visual decision we make.</p>
      
      <h2>Visual Storytelling Through Design</h2>
      <p>Every element of a character's design should tell part of their story. From their posture to their clothing, from their color palette to their proportions, these visual cues communicate volumes about who they are before they speak a single word.</p>
      
      <h2>Balancing Simplicity and Complexity</h2>
      <p>The most memorable characters often have designs that are simple enough to be instantly recognizable but complex enough to be interesting. Finding this balance is crucial, especially in animation where characters need to be drawn consistently from multiple angles and in various poses.</p>
      
      <h2>Emotional Connection</h2>
      <p>At Flavor Studios, our ultimate goal is to create characters that forge an emotional connection with our audience. This means designing characters that feel authentic and relatable, even in fantastical settings. It's this emotional resonance that transforms a well-designed character into a memorable one.</p>
      
      <p>As we continue to develop our original animations, character design remains one of our most important and rewarding challenges. By focusing on personality, visual storytelling, balanced design, and emotional connection, we strive to create characters that will live in the hearts and minds of our audience long after the animation ends.</p>
    `,
    image: "/placeholder.svg?height=600&width=1200&text=Character+Design",
    date: "May 15, 2023",
    author: "Akira Tanaka",
    authorImage: "/placeholder.svg?height=100&width=100&text=AT",
    readTime: "8 min read",
    category: "Art",
  },
  {
    id: 2,
    slug: "storyboard-to-screen",
    title: "From Storyboard to Screen: The Animation Process Explained",
    summary: "A behind-the-scenes look at how we bring our stories to life through animation.",
    content: `
      <p>Animation is a magical process that transforms static drawings into living, breathing stories. At Flavor Studios, we follow a comprehensive pipeline that ensures our animations are not only visually stunning but also emotionally impactful. Let's take a journey through our animation process, from initial concept to final render.</p>
      
      <h2>Concept Development</h2>
      <p>Every project begins with an idea. Our creative team brainstorms concepts, themes, and narratives that align with our studio's mission of creating meaningful, emotionally rich content. Once we have a solid concept, we develop it into a treatment that outlines the story, characters, and visual style.</p>
      
      <h2>Scriptwriting</h2>
      <p>With the concept approved, our writers craft a detailed script that serves as the blueprint for the entire project. The script includes dialogue, scene descriptions, and emotional beats that will guide the animation process.</p>
      
      <h2>Storyboarding</h2>
      <p>Storyboard artists translate the script into a visual sequence of drawings that map out each shot. This crucial step allows us to visualize the flow of the story, plan camera movements, and identify potential challenges before animation begins.</p>
      
      <h2>Character and Environment Design</h2>
      <p>Our design team creates detailed models of characters and environments based on the approved storyboards. In 3D animation, this involves building digital models that can be manipulated and animated.</p>
      
      <h2>Animation</h2>
      <p>This is where the magic happens. Our animators bring the characters to life, frame by frame, creating movement, expression, and emotion. We use Blender as our primary animation tool, allowing us to achieve high-quality results while maintaining creative control.</p>
      
      <h2>Lighting and Rendering</h2>
      <p>Lighting artists set the mood and atmosphere of each scene, while rendering transforms the 3D data into the final images. This process can be time-consuming but is essential for achieving the visual quality we strive for.</p>
      
      <h2>Post-Production</h2>
      <p>The final stage involves adding sound effects, music, and voice acting, as well as color correction and any necessary visual effects. This is where all the elements come together to create the complete animated experience.</p>
      
      <p>Throughout this entire process, our focus remains on storytelling and emotional impact. Technical excellence is important, but it's always in service of creating animations that resonate with our audience on a deeper level.</p>
      
      <p>At Flavor Studios, we believe that understanding the animation process helps us appreciate the craft and make better creative decisions. By sharing our process, we hope to provide insight into the dedication and artistry that goes into every frame of our animations.</p>
    `,
    image: "/placeholder.svg?height=600&width=1200&text=Animation+Process",
    date: "April 22, 2023",
    author: "Mei Lin",
    authorImage: "/placeholder.svg?height=100&width=100&text=ML",
    readTime: "12 min read",
    category: "Production",
  },
  {
    id: 3,
    slug: "anime-evolution",
    title: "The Evolution of Anime: Past, Present, and Future Trends",
    summary: "Examining how anime has evolved over the decades and where it might be heading next.",
    content: `
      <p>Anime has come a long way since its origins in early 20th century Japan. What began as simple black and white animations has evolved into a global cultural phenomenon with diverse styles, genres, and audiences. At Flavor Studios, we draw inspiration from this rich history while looking toward the future of animation.</p>
      
      <h2>The Early Days</h2>
      <p>The foundations of anime were laid in the early 1900s when Japanese artists began experimenting with animation techniques imported from the West. The first Japanese animated film, "Namakura Gatana" (Blunt Sword), was released in 1917. However, it wasn't until the post-World War II era that anime began to develop its distinctive style and identity.</p>
      
      <h2>The Golden Age</h2>
      <p>The 1960s and 70s saw the emergence of what many consider the golden age of anime. Osamu Tezuka, often called the "God of Manga," revolutionized both manga and anime with works like "Astro Boy," establishing many of the visual conventions that would come to define the medium. This period also saw the rise of mecha anime with series like "Mobile Suit Gundam," which introduced more complex narratives and themes.</p>
      
      <h2>Global Recognition</h2>
      <p>The 1980s and 90s marked anime's expansion onto the global stage. Films like Akira (1988) and Ghost in the Shell (1995) showcased the medium's potential for sophisticated storytelling and visual innovation. Meanwhile, series like Dragon Ball Z and Sailor Moon gained international popularity, introducing anime to new generations of viewers worldwide.</p>
      
      <h2>The Digital Revolution</h2>
      <p>The 2000s brought significant technological changes to anime production. Traditional cel animation gave way to digital techniques, allowing for new visual possibilities while streamlining the production process. This period also saw the rise of streaming platforms, making anime more accessible than ever before and contributing to its growing global audience.</p>
      
      <h2>Current Trends</h2>
      <p>Today's anime landscape is characterized by incredible diversity. From mainstream shonen series to niche slice-of-life shows, from traditional 2D animation to CGI hybrids, the medium continues to evolve and experiment. The industry has also seen increased collaboration between Japanese studios and international partners, reflecting anime's global influence.</p>
      
      <h2>The Future of Anime</h2>
      <p>Looking ahead, several trends seem poised to shape the future of anime:</p>
      <ul>
        <li>Integration of AI and machine learning in animation production</li>
        <li>Continued growth of streaming platforms and their influence on content</li>
        <li>Increased diversity in storytelling, reflecting broader global perspectives</li>
        <li>Experimentation with new technologies like VR and AR</li>
        <li>Greater emphasis on sustainability in animation production</li>
      </ul>
      
      <p>At Flavor Studios, we're excited to be part of this evolving landscape. While we honor the traditions and techniques that have made anime such a powerful medium, we're also eager to explore new possibilities and contribute to its ongoing evolution.</p>
      
      <p>The history of anime is a testament to the power of artistic innovation and cultural exchange. As we look to the future, we're inspired by the medium's ability to continually reinvent itself while maintaining its core appeal: telling compelling stories that resonate with audiences across cultural and linguistic boundaries.</p>
    `,
    image: "/placeholder.svg?height=600&width=1200&text=Anime+Evolution",
    date: "March 10, 2023",
    author: "Hiroshi Nakamura",
    authorImage: "/placeholder.svg?height=100&width=100&text=HN",
    readTime: "15 min read",
    category: "Industry",
  },
]

export default function BlogPostClient({ slug }: { slug: string }) {
  const [post, setPost] = useState<(typeof blogPosts)[0] | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate fetching post data
    setIsLoading(true)
    setTimeout(() => {
      const foundPost = blogPosts.find((p) => p.slug === slug)
      setPost(foundPost || null)
      setIsLoading(false)
    }, 500)
  }, [slug])

  if (isLoading) {
    return (
      <div className="relative pt-16">
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl">
              <Skeleton className="h-10 w-3/4 mb-4" />
              <Skeleton className="h-6 w-1/2 mb-8" />
              <Skeleton className="h-[400px] w-full mb-8" />
              <div className="space-y-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-6 w-5/6" />
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="relative pt-16">
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl text-center">
              <h1 className="font-heading text-3xl font-bold mb-4">Post Not Found</h1>
              <p className="text-muted-foreground mb-6">
                The blog post you're looking for doesn't exist or has been moved.
              </p>
              <Button asChild>
                <Link href="/blog">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="relative pt-16">
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/blog">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog
                </Link>
              </Button>
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="font-heading text-3xl md:text-4xl font-bold mb-4"
            >
              {post.title}
            </motion.h1>

            <div className="flex flex-wrap items-center gap-4 mb-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{post.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{post.readTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                <span>{post.category}</span>
              </div>
            </div>

            <div className="relative aspect-[16/9] overflow-hidden rounded-lg mb-8">
              <Image src={post.image || "/placeholder.svg"} alt={post.title} fill className="object-cover" />
            </div>

            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
              </CardContent>
            </Card>

            <div className="mt-12 border-t pt-8">
              <h2 className="font-heading text-2xl font-bold mb-4">Share this article</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Twitter
                </Button>
                <Button variant="outline" size="sm">
                  Facebook
                </Button>
                <Button variant="outline" size="sm">
                  LinkedIn
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
