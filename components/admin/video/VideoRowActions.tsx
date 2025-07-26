'use client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Pencil, Eye, Archive, Upload, Trash2 } from 'lucide-react'
import type { Video } from '@/lib/content-store'

export type AdminVideo = Video & {
  slug: string
  episodeNumber?: number | string
  season?: string
}

export interface VideoRowActionsProps {
  video: AdminVideo
  onDelete: (id: string) => void
  onTogglePublish: (id: string, publish: boolean) => void
}

export default function VideoRowActions({ video, onDelete, onTogglePublish }: VideoRowActionsProps) {
  const isPublished = video.status === 'published'
  return (
    <div className="flex gap-2">
      <Button asChild variant="ghost" size="icon">
        <Link href={`/admin/video/edit?id=${video.id}`}>
          <Pencil className="h-4 w-4" />
        </Link>
      </Button>
      <Button asChild variant="ghost" size="icon">
        <Link href={`/watch/${video.slug}`} target="_blank">
          <Eye className="h-4 w-4" />
        </Link>
      </Button>
      <Button variant="ghost" size="icon" onClick={() => onTogglePublish(video.id, !isPublished)}>
        {isPublished ? <Archive className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
      </Button>
      <Button variant="ghost" size="icon" className="text-red-600" onClick={() => onDelete(video.id)}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
