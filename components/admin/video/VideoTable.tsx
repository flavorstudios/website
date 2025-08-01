"use client"
import { useRef } from 'react'
import { motion } from 'framer-motion'
import { Checkbox } from '@/components/ui/checkbox'
import VideoStatusBadge from './VideoStatusBadge'
import VideoRowActions, { AdminVideo } from './VideoRowActions'
import { formatDate } from "@/lib/date"

export interface VideoTableProps {
  videos: AdminVideo[]
  selected: Set<string>
  toggleSelect: (id: string) => void
  toggleSelectAll: (checked: boolean) => void
  onDelete: (id: string) => void
  onTogglePublish: (id: string, publish: boolean) => void
}

export default function VideoTable({
  videos,
  selected,
  toggleSelect,
  toggleSelectAll,
  onDelete,
  onTogglePublish
}: VideoTableProps) {
  const allSelected = videos.length > 0 && videos.every(v => selected.has(v.id))
  const rowRefs = useRef<HTMLTableRowElement[]>([])

  return (
    <div className="overflow-x-auto border rounded-lg">
      <table className="min-w-full bg-white text-sm">
        <thead className="bg-gray-50 text-xs uppercase text-gray-500">
          <tr>
            <th className="p-3 w-8">
              <Checkbox
                checked={allSelected}
                onCheckedChange={v => toggleSelectAll(!!v)}
                aria-label="Select all videos"
              />
            </th>
            <th className="p-3 text-left">Title</th>
            <th className="p-3 text-left hidden md:table-cell">Category</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left hidden sm:table-cell">Date</th>
            <th className="p-3 text-right hidden sm:table-cell">Views</th>
            <th className="p-3 text-left hidden md:table-cell">Duration</th>
            <th className="p-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {videos.map((video, idx) => (
            <motion.tr
              key={video.id}
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
              <td className="p-3">
                <Checkbox
                  checked={selected.has(video.id)}
                  onCheckedChange={() => toggleSelect(video.id)}
                  aria-label={`Select video: ${video.title}`}
                />
              </td>
              <td className="p-3">
                <a
                  href={`/admin/video/edit?id=${video.id}`}
                  className="text-blue-600 hover:underline font-medium"
                  aria-label={`Edit video: ${video.title}`}
                >
                  {video.title}
                </a>
              </td>
              <td className="p-3 hidden md:table-cell">{video.category}</td>
              <td className="p-3">
                <VideoStatusBadge status={video.status as AdminVideo["status"]} />
              </td>
              <td className="p-3 hidden sm:table-cell">
                {formatDate(video.publishedAt || video.createdAt)}
              </td>
              <td className="p-3 text-right hidden sm:table-cell">
                {(typeof video.views === "number" ? video.views : 0).toLocaleString()}
              </td>
              <td className="p-3 hidden md:table-cell">{video.duration}</td>
              <td className="p-3 text-right">
                <VideoRowActions
                  video={video}
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
