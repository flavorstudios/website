'use client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Pencil, Eye, Archive, Upload, Trash2 } from 'lucide-react'
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
      <Button asChild variant="ghost" size="icon">
        <Link href={`/admin/blog/edit?id=${post.id}`}>
          <Pencil className="h-4 w-4" />
        </Link>
      </Button>
      <Button asChild variant="ghost" size="icon">
        <Link href={`/admin/preview/${post.id}`} target="_blank">
          <Eye className="h-4 w-4" />
        </Link>
      </Button>
      <Button variant="ghost" size="icon" onClick={() => onTogglePublish(post.id, !isPublished)}>
        {isPublished ? <Archive className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
      </Button>
      <Button variant="ghost" size="icon" className="text-red-600" onClick={() => onDelete(post.id)}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
