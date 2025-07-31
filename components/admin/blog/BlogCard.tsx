"use client"
import { Checkbox } from "@/components/ui/checkbox"
import BlogRowActions from "./BlogRowActions"
import BlogStatusBadge from "./BlogStatusBadge"
import type { BlogPost } from "@/lib/content-store"
import { formatDate } from "@/lib/date"

export interface BlogCardProps {
  post: BlogPost
  selected: boolean
  toggleSelect: (id: string) => void
  onDelete: (id: string) => void
  onTogglePublish: (id: string, publish: boolean) => void
}

export default function BlogCard({
  post,
  selected,
  toggleSelect,
  onDelete,
  onTogglePublish,
}: BlogCardProps) {
  return (
    <div className="sm:hidden bg-white border-b last:border-b-0 p-3 flex flex-col gap-2 rounded-lg shadow-sm mt-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          <Checkbox
            checked={selected}
            onCheckedChange={() => toggleSelect(post.id)}
            aria-label={`Select blog post: ${post.title}`}
          />
          <div className="flex flex-col">
            <a
              href={`/admin/blog/edit?id=${post.id}`}
              className="font-medium text-blue-600 hover:underline"
              aria-label={`Edit blog post: ${post.title}`}
            >
              {post.title}
            </a>
            <span className="text-xs text-gray-500">
              {formatDate(post.publishedAt || post.createdAt)}
            </span>
          </div>
        </div>
        <BlogRowActions
          post={post}
          onDelete={onDelete}
          onTogglePublish={onTogglePublish}
        />
      </div>
      <div className="flex items-center justify-between text-xs">
        <BlogStatusBadge status={post.status as BlogPost["status"]} />
        <div className="flex gap-2">
          <span>{post.views?.toLocaleString?.() ?? 0} views</span>
          <span>
            {post.commentCount ?? 0} {post.commentCount === 1 ? "comment" : "comments"}
          </span>
        </div>
      </div>
    </div>
  )
}