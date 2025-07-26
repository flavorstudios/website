"use client"

import { motion } from "framer-motion"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import BlogStatusBadge from "./BlogStatusBadge"
import BlogRowActions from "./BlogRowActions"
import type { BlogPost } from "@/lib/content-store"

export interface BlogTableProps {
  posts: BlogPost[]
  selected: Set<string>
  toggleSelect: (id: string) => void
  toggleSelectAll: (checked: boolean) => void
  onDelete: (id: string) => void
  onTogglePublish: (id: string, publish: boolean) => void
}

export default function BlogTable({
  posts,
  selected,
  toggleSelect,
  toggleSelectAll,
  onDelete,
  onTogglePublish,
}: BlogTableProps) {
  const allSelected = posts.length > 0 && posts.every((p) => selected.has(p.id))

  return (
    <div className="overflow-x-auto border rounded-lg">
      <table className="min-w-full bg-white text-sm">
        <thead className="bg-gray-50 text-xs uppercase text-gray-500">
          <tr>
            <th className="p-3 w-8">
              <Checkbox
                checked={allSelected}
                onCheckedChange={(v) => toggleSelectAll(!!v)}
              />
            </th>
            <th className="p-3 text-left">Title</th>
            <th className="p-3 text-left hidden md:table-cell">SEO</th>
            <th className="p-3 text-left">Author</th>
            <th className="p-3 text-left hidden md:table-cell">Image</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left hidden sm:table-cell">Date</th>
            <th className="p-3 text-right hidden sm:table-cell">Views</th>
            <th className="p-3 text-right hidden sm:table-cell">Comments</th>
            <th className="p-3 text-left hidden lg:table-cell">Tags</th>
            <th className="p-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <motion.tr
              key={post.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-b last:border-b-0 hover:bg-gray-50"
            >
              <td className="p-3">
                <Checkbox
                  checked={selected.has(post.id)}
                  onCheckedChange={() => toggleSelect(post.id)}
                />
              </td>

              {/* Title with link */}
              <td className="p-3">
                <a
                  href={`/admin/blog/edit?id=${post.id}`}
                  className="text-blue-600 hover:underline font-medium"
                >
                  {post.title}
                </a>
              </td>

              {/* SEO Title Length */}
              <td className="p-3 hidden md:table-cell">
                <span
                  className={
                    post.seoTitle.length === 0
                      ? "text-gray-500"
                      : post.seoTitle.length < 50
                      ? "text-yellow-600"
                      : post.seoTitle.length > 60
                      ? "text-red-600"
                      : "text-green-600"
                  }
                >
                  {post.seoTitle.length}
                </span>
              </td>

              <td className="p-3">{post.author}</td>

              {/* Image Preview */}
              <td className="p-3 hidden md:table-cell">
                {post.featuredImage && (
                  <img
                    src={post.featuredImage}
                    alt=""
                    className="h-10 w-16 object-cover rounded"
                  />
                )}
              </td>

              <td className="p-3">
                <BlogStatusBadge status={post.status as BlogPost["status"]} />
              </td>

              <td className="p-3 hidden sm:table-cell">
                {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
              </td>

              {/* View count */}
              <td className="p-3 text-right hidden sm:table-cell">
                {post.views?.toLocaleString?.() ?? 0}
              </td>

              {/* Comment count */}
              <td className="p-3 text-right hidden sm:table-cell">
                <Badge variant="outline">{post.commentCount ?? 0}</Badge>
              </td>

              {/* Tags */}
              <td className="p-3 hidden lg:table-cell">
                {post.tags?.join(", ")}
              </td>

              <td className="p-3 text-right">
                <BlogRowActions
                  post={post}
                  onDelete={onDelete}
                  onTogglePublish={onTogglePublish}
                />
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
