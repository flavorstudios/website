"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export interface BlogPost {
  title: string
  slug: string
  excerpt: string
  content: string
  category?: string
  categories?: string[]
  tags?: string[]
  featuredImage?: string
}

interface BlogPostRendererProps {
  post: BlogPost
}

export function BlogPostRenderer({ post }: BlogPostRendererProps) {
  const primaryCategory =
    post.categories && post.categories.length > 0
      ? post.categories[0]
      : post.category

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          {primaryCategory && <Badge variant="outline">{primaryCategory}</Badge>}
        </div>
        <h1 className="text-4xl font-bold mb-2 text-gray-900 leading-tight">
          {post.title || "Untitled"}
        </h1>
        {post.slug && (
          <p className="text-sm text-gray-500 mb-2">/blog/{post.slug}</p>
        )}
        {post.excerpt && <p className="text-lg text-gray-600">{post.excerpt}</p>}
      </header>
      {post.featuredImage && (
        <div className="mb-8">
          <img
            src={post.featuredImage}
            alt={post.title || "Featured image"}
            className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
          />
        </div>
      )}
      {post.content && (
        <Card className="mb-12">
          <CardContent className="p-8">
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </CardContent>
        </Card>
      )}
      {post.tags && post.tags.length > 0 && (
        <div className="mb-12">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </article>
  )
}

export default BlogPostRenderer
