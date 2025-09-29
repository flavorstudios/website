'use client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Pencil, Eye, Archive, Upload, Trash2, Loader2 } from 'lucide-react'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { BlogPost } from '@/lib/content-store'
import { cn } from '@/lib/utils'
import { usePreviewNavigation } from './usePreviewNavigation'

export interface BlogRowActionsProps {
  post: BlogPost
  onDelete: (id: string) => void
  onTogglePublish: (id: string, publish: boolean) => void
  className?: string
}

export default function BlogRowActions({
  post,
  onDelete,
  onTogglePublish,
  className,
}: BlogRowActionsProps) {
  const isPublished = post.status === 'published'
  const { openPreview, loadingId } = usePreviewNavigation()
  const previewing = loadingId === post.id

  return (
    <div className={cn('flex gap-2', className)}>
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
              <Pencil className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Edit</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label={previewing ? 'Loading preview' : 'Preview post'}
            title={previewing ? 'Loading preview…' : 'Preview'}
            onClick={() => openPreview(post.id)}
            disabled={previewing}
          >
            {previewing ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{previewing ? 'Loading…' : 'Preview'}</TooltipContent>
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
              <Archive className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Upload className="h-4 w-4" aria-hidden="true" />
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
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Delete</TooltipContent>
      </Tooltip>
    </div>
  )
}
