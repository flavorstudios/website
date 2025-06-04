// /components/ui/featured-post-card.tsx

import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function FeaturedPostCard({ post, priority = false, className = "" }) {
  if (!post) return null

  return (
    <Card className={`relative shadow-lg border-2 border-yellow-400 bg-white transition-transform hover:scale-[1.025] ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex flex-wrap gap-2 mb-1">
          {post.categories &&
            post.categories.map((cat) => (
              <Badge key={cat.id} className="bg-blue-100 text-blue-700 font-medium">
                {cat.name}
              </Badge>
            ))}
          <Badge className="bg-yellow-400 text-yellow-900 font-semibold">Featured</Badge>
        </div>
        <CardTitle>
          <Link href={`/blog/${post.slug}`}>
            <span className="hover:underline">{post.title}</span>
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 line-clamp-3 mb-3">{post.excerpt || post.summary}</p>
        <div className="flex flex-wrap gap-3 items-center text-xs text-gray-500 mt-4">
          <span>{post.author?.name || "Flavor Studios"}</span>
          <span>·</span>
          <span>
            {post.publishedAt
              ? new Date(post.publishedAt).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : ""}
          </span>
          <span>·</span>
          <span>
            {post.readTime || 5} min read
          </span>
        </div>
      </CardContent>
      {/* Make the whole card clickable */}
      <Link
        href={`/blog/${post.slug}`}
        className="absolute inset-0 z-10"
        aria-label={`Read: ${post.title}`}
      />
    </Card>
  )
}