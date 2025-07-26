'use client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Pencil, Eye, Archive, Upload, Trash2 } from 'lucide-react'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
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
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            asChild
            variant="ghost"
            size="icon"
            aria-label="Edit video"
            title="Edit"
          >
            <Link href={`/admin/video/edit?id=${video.id}`}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Edit</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            asChild
            variant="ghost"
            size="icon"
            aria-label="View on site"
            title="View"
          >
            <Link href={`/watch/${video.slug}`} target="_blank">
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent>View</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label={isPublished ? 'Unpublish video' : 'Publish video'}
            title={isPublished ? 'Unpublish' : 'Publish'}
            onClick={() => onTogglePublish(video.id, !isPublished)}
          >
            {isPublished ? (
              <Archive className="h-4 w-4" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{isPublished ? 'Unpublish' : 'Publish'}</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="text-red-600"
            aria-label="Delete video"
            title="Delete"
            onClick={() => onDelete(video.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Delete</TooltipContent>
      </Tooltip>
    </div>
  )
}
