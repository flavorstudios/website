"use client"
import { motion } from 'framer-motion'
import { Checkbox } from '@/components/ui/checkbox'
import VideoStatusBadge from './VideoStatusBadge'
import VideoRowActions, { AdminVideo } from './VideoRowActions'
import { formatDate } from "@/lib/date" // <-- Added

export interface VideoTableProps {
  videos: AdminVideo[]
  selected: Set<string>
  toggleSelect: (id: string) => void
  toggleSelectAll: (checked: boolean) => void
  onDelete: (id: string) => void
  onTogglePublish: (id: string, publish: boolean) => void
}

export default function VideoTable({ videos, selected, toggleSelect, toggleSelectAll, onDelete, onTogglePublish }: VideoTableProps) {
  const allSelected = videos.length > 0 && videos.every(v => selected.has(v.id))
  return (
    <div className="overflow-x-auto border rounded-lg">
      <table className="min-w-full bg-white text-sm">
        <thead className="bg-gray-50 text-xs uppercase text-gray-500">
          <tr>
            <th className="p-3 w-8">
              <Checkbox checked={allSelected} onCheckedChange={v => toggleSelectAll(!!v)} />
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
          {videos.map(video => (
            <motion.tr
              key={video.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-b last:border-b-0 hover:bg-gray-50"
            >
              <td className="p-3">
                <Checkbox checked={selected.has(video.id)} onCheckedChange={() => toggleSelect(video.id)} />
              </td>
              <td className="p-3">
                <a href={`/admin/video/edit?id=${video.id}`} className="text-blue-600 hover:underline font-medium">
                  {video.title}
                </a>
              </td>
              <td className="p-3 hidden md:table-cell">{video.category}</td>
              <td className="p-3">
                <VideoStatusBadge status={video.status as Video['status']} />
              </td>
              <td className="p-3 hidden sm:table-cell">
                {formatDate(video.publishedAt || video.createdAt)}
              </td>
              <td className="p-3 text-right hidden sm:table-cell">{video.views?.toLocaleString?.() ?? 0}</td>
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
