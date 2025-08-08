'use client'
import { Button } from '@/components/ui/button'
import { Upload, Archive, Trash2 } from 'lucide-react'

export interface VideoBulkActionsProps {
  count: number
  onPublish: () => void
  onUnpublish: () => void
  onDelete: () => void
  /** When true, shows a fixed action bar at the bottom on small screens */
  sticky?: boolean
}

export default function VideoBulkActions({
  count,
  onPublish,
  onUnpublish,
  onDelete,
  sticky,
}: VideoBulkActionsProps) {
  if (count === 0) return null
  return (
    <div
      className={
        sticky
          ? 'fixed bottom-0 left-0 right-0 z-20 flex items-center justify-center gap-2 border-t bg-white p-2 shadow sm:static sm:justify-start sm:border-0 sm:p-0 sm:shadow-none'
          : 'flex items-center gap-2'
      }
    >
      <span className="text-sm text-muted-foreground mr-2">{count} selected</span>
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
