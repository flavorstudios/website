'use client'
import { Button } from '@/components/ui/button'
import { Upload, Archive, Trash2 } from 'lucide-react'

export interface VideoBulkActionsProps {
  count: number
  onPublish: () => void
  onUnpublish: () => void
  onDelete: () => void
}

export default function VideoBulkActions({ count, onPublish, onUnpublish, onDelete }: VideoBulkActionsProps) {
  if (count === 0) return null
  return (
    <div
      role="region"
      aria-label="Bulk actions"
      className="flex items-center gap-2"
    >
      <span aria-live="polite" className="text-sm text-muted-foreground mr-2">
        {count} selected
      </span>
      <Button variant="outline" size="sm" onClick={onPublish}>
        <Upload className="h-4 w-4 mr-1" /> Publish
      </Button>
      <Button variant="outline" size="sm" onClick={onUnpublish}>
        <Archive className="h-4 w-4 mr-1" /> Unpublish
      </Button>
      <Button variant="outline" size="sm" className="text-red-600" onClick={onDelete}>
        <Trash2 className="h-4 w-4 mr-1" /> Delete
      </Button>
    </div>
  )
}
