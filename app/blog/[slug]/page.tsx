import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Calendar, User, Clock, Share2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getPostData } from "@/lib/posts";
import CommentSection from "@/components/CommentSection"; // <-- Import your CommentSection

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = await getPostData(params.slug);

  // Fallback values for optional fields
  const summary = post.summary || post.excerpt || "A new perspective from the world of Flavor Studios.";
  const coverImage = post.image
    ? `/abstract-geometric-shapes.png?key=uce0t&key=1heqp&height=720&width=1280&query=${post.image}`
    : "https://flavorstudios.in/og-image.jpg";
  const publishedAt = post.date || new Date().toISOString();
  const updatedAt = post.updatedAt || publishedAt;
  const authorName = post.author || "Flavor Studios Team";

  return {
    title: `${post.title} – Flavor Studios Blog`,
    description: summary,
    openGraph: {
      title: post.title,
      description: summary,
      url: `https://flavorstudios.in/blog/${params.slug}`,
      type: "article",
      publishedTime: publishedAt,
      authors: [authorName],
      images: [
        {
          url: coverImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      siteName: "Flavor Studios",
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: summary,
      images: [coverImage],
    },
  };
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = params;

  // For this example, hardcoded post data; replace with your real post fetch
  const post = {
    title: "The Evolution of Anime Art Styles",
    excerpt: "Exploring how Japanese animation art styles have changed over the decades and influenced global media.",
    category: "Analysis",
    date: "May 15, 2023",
    author: "Alex Chen",
    readTime: "8 min read",
    image: "anime%20art%20styles%20evolution%20detailed",
    content: `
      <p class="mb-4">Anime, as we know it today, has undergone significant transformations since its inception...</p>
      <!-- content truncated for brevity -->
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
  };

  // --- JSON-LD Schema for SEO (NEW) ---
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: [`https://flavorstudios.in/og-image.jpg`],
    author: {
      "@type": "Person",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: "Flavor Studios",
      logo: {
        "@type": "ImageObject",
        url: "https://flavorstudios.in/logo.png",
      },
    },
    datePublished: post.date,
    dateModified: post.date,
    mainEntityOfPage: `https://flavorstudios.in/blog/${slug}`,
  };
  // -------------------------------------

  return (
    <div className="flex flex-col min-h-screen">
      {/* Inject Schema Here */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

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

            {/* --- COMMENTS SECTION --- */}
            <CommentSection postId={slug} />
            {/* ---------------------- */}
          </div>
        </div>
      </section>
    </div>
  );
}