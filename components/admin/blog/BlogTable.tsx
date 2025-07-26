"use client"
import { motion } from 'framer-motion'
import { Checkbox } from '@/components/ui/checkbox'
import BlogStatusBadge from './BlogStatusBadge'
import BlogRowActions from './BlogRowActions'
import type { BlogPost } from '@/lib/content-store'

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
  onTogglePublish
}: BlogTableProps) {
  const allSelected = posts.length > 0 && posts.every((p) => selected.has(p.id))
  return (
    <div className="overflow-x-auto border rounded-lg">
      <table className="min-w-full bg-white text-sm">
        <thead className="bg-gray-50 text-xs uppercase text-gray-500">
          <tr>
            <th className="p-3 w-8">
              <Checkbox checked={allSelected} onCheckedChange={(v) => toggleSelectAll(!!v)} />
            </th>
            <th className="p-3 text-left">Title</th>
            <th className="p-3 text-left">Author</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Date</th>
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
                <Checkbox checked={selected.has(post.id)} onCheckedChange={() => toggleSelect(post.id)} />
              </td>
              <td className="p-3">
                <a href={`/admin/blog/edit?id=${post.id}`} className="text-blue-600 hover:underline font-medium">
                  {post.title}
                </a>
              </td>
              <td className="p-3">{post.author}</td>
              <td className="p-3">
                <BlogStatusBadge status={post.status as BlogPost["status"]} />
              </td>
              <td className="p-3">{new Date(post.publishedAt || post.createdAt).toLocaleDateString()}</td>
              <td className="p-3 text-right">
                <BlogRowActions post={post} onDelete={onDelete} onTogglePublish={onTogglePublish} />
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
