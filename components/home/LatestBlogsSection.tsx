import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import ErrorFallback from "@/components/home/ErrorFallback";
import { formatDate } from "@/lib/date";
import type { BlogPost } from "@/lib/content-store";

export default function LatestBlogsSection({ posts }: { posts: BlogPost[] }) {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Latest Blog Posts</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Dive into our latest articles covering anime reviews, industry insights, and creative storytelling.
          </p>
        </div>
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={post.featuredImage || "/placeholder.svg"}
                      alt={post.title || "Anime blog cover"}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-105"
                      loading="lazy"
                      decoding="async"
                      sizes="(max-width: 768px) 100vw, 33vw"
                      priority={false}
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <CardHeader className="pb-3">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      {Array.isArray(post.categories) && post.categories.length > 0
                        ? post.categories.map((cat) => (
                            <Badge variant="outline" className="text-xs" key={cat}>
                              {cat}
                            </Badge>
                          ))
                        : post.category && (
                            <Badge variant="outline" className="text-xs">
                              {post.category}
                            </Badge>
                          )}
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" aria-hidden="true" />
                        {formatDate(post.publishedAt)}
                      </span>
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" aria-hidden="true" />
                        {post.readTime || "5 min read"}
                      </span>
                    </div>
                    <CardTitle className="line-clamp-2 text-lg leading-tight">{post.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 line-clamp-3 text-sm leading-relaxed">{post.excerpt}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <ErrorFallback section="blog posts" />
        )}
        <div className="text-center">
          <Button asChild size="lg" variant="outline" className="px-8">
            <Link href="/blog">
              View All Posts
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}