"use client"

import { useRef, useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import BlogStatusBadge from "./BlogStatusBadge"
import BlogRowActions from "./BlogRowActions"
import type { BlogPost } from "@/lib/content-store"
import Image from "next/image"
import { formatDate } from "@/lib/date"

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
  const rowRefs = useRef<HTMLTableRowElement[]>([])
  const [width, setWidth] = useState<number>(1024)

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth)
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <svg
          width="56"
          height="56"
          viewBox="0 0 56 56"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="mb-2"
          aria-hidden="true"
        >
          <rect width="56" height="56" rx="12" fill="#F3F4F6" />
          <path d="M19 29V35C19 35.5523 19.4477 36 20 36H36C36.5523 36 37 35.5523 37 35V29" stroke="#A1A1AA" strokeWidth="2" strokeLinecap="round" />
          <rect x="15" y="19" width="26" height="10" rx="2" stroke="#A1A1AA" strokeWidth="2" />
          <circle cx="28" cy="24" r="1.5" fill="#A1A1AA" />
        </svg>
        <span className="text-lg font-medium">No blog posts found</span>
        <span className="text-sm mt-2">Try changing your filters or create a new post.</span>
      </div>
    )
  }

  /** Mobile: render card list at <640px to prevent table overflow */
  if (width < 640) {
    return (
      <div className="space-y-2" data-testid="blog-card-list">
        <div className="flex items-center gap-2 mb-2">
          <Checkbox
            checked={allSelected}
            onCheckedChange={(v) => toggleSelectAll(!!v)}
            aria-label="Select all posts"
          />
          <span className="text-xs">Select all</span>
        </div>

        {posts.map((post) => (
          <div
            key={post.id}
            className="border rounded p-3 flex gap-2"
            data-testid="blog-card"
          >
            <Checkbox
              aria-label={`Select blog post: ${post.title}`}
              checked={selected.has(post.id)}
              onCheckedChange={() => toggleSelect(post.id)}
            />
            <a
              href={`/admin/blog/edit?id=${post.id}`}
              className="flex gap-2 flex-1 text-left focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label={`Edit blog post: ${post.title}`}
            >
              {post.featuredImage && (
                <Image
                  src={post.featuredImage}
                  alt=""
                  aria-hidden="true"
                  width={64}
                  height={40}
                  className="h-10 w-16 object-cover rounded flex-shrink-0"
                  loading="lazy"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate text-sm">{post.title}</p>
                <p className="text-xs text-gray-500">
                  {formatDate(post.publishedAt || post.createdAt)}
                </p>
                <p className="text-xs mt-1">
                  <BlogStatusBadge status={post.status as BlogPost["status"]} />
                </p>
              </div>
            </a>
          </div>
        ))}
      </div>
    )
  }

  /** Desktop/tablet: full table with scoped headers */
  return (
    <div className="overflow-x-auto border rounded-lg">
      <table className="min-w-full bg-white text-sm table-fixed">
        <thead className="bg-gray-50 text-xs uppercase text-gray-500">
          <tr>
            <th scope="col" className="p-3 w-8">
              <Checkbox
                checked={allSelected}
                onCheckedChange={(v) => toggleSelectAll(!!v)}
                aria-label="Select all"
              />
            </th>
            <th scope="col" className="p-3 text-left max-w-[12rem] truncate">Title</th>
            <th scope="col" className="p-3 text-left hidden md:table-cell">SEO</th>
            <th scope="col" className="p-3 text-left">Author</th>
            <th scope="col" className="p-3 text-left hidden md:table-cell">Image</th>
            <th scope="col" className="p-3 text-left">Status</th>
            <th scope="col" className="p-3 text-left hidden sm:table-cell">Date</th>
            <th scope="col" className="p-3 text-right hidden sm:table-cell">Views</th>
            <th scope="col" className="p-3 text-right hidden sm:table-cell">Comments</th>
            <th scope="col" className="p-3 text-left hidden lg:table-cell">Tags</th>
            <th scope="col" className="p-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post, idx) => (
            <motion.tr
              key={post.id}
              ref={el => (rowRefs.current[idx] = el!)}
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === "ArrowDown") {
                  e.preventDefault()
                  rowRefs.current[idx + 1]?.focus()
                } else if (e.key === "ArrowUp") {
                  e.preventDefault()
                  rowRefs.current[idx - 1]?.focus()
                }
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-b last:border-b-0 hover:bg-gray-50 focus-visible:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {/* Select checkbox */}
              <td className="p-3">
                <Checkbox
                  checked={selected.has(post.id)}
                  onCheckedChange={() => toggleSelect(post.id)}
                  aria-label={`Select blog post: ${post.title}`}
                />
              </td>

              {/* Title with link (truncated for overflow) */}
              <td className="p-3 max-w-[12rem] truncate">
                <a
                  href={`/admin/blog/edit?id=${post.id}`}
                  className="text-blue-600 hover:underline font-medium"
                  aria-label={`Edit blog post: ${post.title}`}
                >
                  {post.title}
                </a>
              </td>

              {/* SEO Title Length */}
              <td className="p-3 hidden md:table-cell">
                <span
                  title={
                    !post.seoTitle || post.seoTitle.length === 0
                      ? "Missing SEO title"
                      : post.seoTitle.length < 50
                      ? "SEO title is too short"
                      : post.seoTitle.length > 60
                      ? "SEO title is too long"
                      : "SEO title length is optimal"
                  }
                  className={
                    !post.seoTitle || post.seoTitle.length === 0
                      ? "text-gray-500"
                      : post.seoTitle.length < 50
                      ? "text-yellow-600"
                      : post.seoTitle.length > 60
                      ? "text-red-600"
                      : "text-green-600"
                  }
                >
                  {post.seoTitle?.length ?? 0}
                </span>
              </td>

              {/* Author */}
              <td className="p-3">{post.author}</td>

              {/* Image Preview */}
              <td className="p-3 hidden md:table-cell">
                {post.featuredImage ? (
                  <Image
                    src={post.featuredImage}
                    alt={`Featured image for ${post.title}`}
                    width={64}
                    height={40}
                    className="h-10 w-16 object-cover rounded"
                    style={{ objectFit: "cover" }}
                    loading="lazy"
                  />
                ) : (
                  <span className="text-xs text-gray-400">—</span>
                )}
              </td>

              {/* Status Badge */}
              <td className="p-3">
                <BlogStatusBadge status={post.status as BlogPost["status"]} />
              </td>

              {/* Date */}
              <td className="p-3 hidden sm:table-cell">
                {formatDate(post.publishedAt || post.createdAt)}
              </td>

              {/* Views */}
              <td className="p-3 text-right hidden sm:table-cell">
                {(typeof post.views === "number" ? post.views : 0).toLocaleString()}
              </td>

              {/* Comments */}
              <td className="p-3 text-right hidden sm:table-cell">
                <Badge variant="outline">{post.commentCount ?? 0}</Badge>
              </td>

              {/* Tags */}
              <td className="p-3 hidden lg:table-cell">
                {post.tags?.length
                  ? post.tags.slice(0, 3).map((tag, i) => (
                      <Badge key={i} variant="secondary" className="mr-1">
                        {tag}
                      </Badge>
                    ))
                  : <span className="text-xs text-gray-400">—</span>
                }
              </td>

              {/* Row Actions */}
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
