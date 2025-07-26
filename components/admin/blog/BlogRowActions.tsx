'use client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Pencil, Eye, Archive, Upload, Trash2 } from 'lucide-react'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { BlogPost } from '@/lib/content-store'

export interface BlogRowActionsProps {
  post: BlogPost
  onDelete: (id: string) => void
  onTogglePublish: (id: string, publish: boolean) => void
}

export default function BlogRowActions({ post, onDelete, onTogglePublish }: BlogRowActionsProps) {
  const isPublished = post.status === 'published'
  return (
    <div className="flex gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            asChild
            variant="ghost"
            size="icon"
            aria-label="Edit post"
            title="Edit"
          >
            <Link href={`/admin/blog/edit?id=${post.id}`}>
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
            aria-label="Preview post"
            title="Preview"
          >
            <Link href={`/admin/preview/${post.id}`} target="_blank">
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Preview</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label={isPublished ? 'Unpublish post' : 'Publish post'}
            title={isPublished ? 'Unpublish' : 'Publish'}
            onClick={() => onTogglePublish(post.id, !isPublished)}
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
            aria-label="Delete post"
            title="Delete"
            onClick={() => onDelete(post.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Delete</TooltipContent>
      </Tooltip>
    </div>
  )
}
