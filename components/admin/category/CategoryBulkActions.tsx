"use client"
import { Button } from "@/components/ui/button"
import { Upload, Archive, Trash2, XCircle } from "lucide-react"

export interface CategoryBulkActionsProps {
  count: number
  onPublish: () => void
  onUnpublish: () => void
  onDelete: () => void
  onClear: () => void
}

export default function CategoryBulkActions({
  count,
  onPublish,
  onUnpublish,
  onDelete,
  onClear,
}: CategoryBulkActionsProps) {
  if (count === 0) return null
  return (
    <div
      role="region"
      aria-label="Bulk actions"
      className="fixed bottom-0 left-0 right-0 z-20 flex items-center justify-center gap-2 border-t bg-white p-2 shadow sm:static sm:justify-start sm:border-0 sm:p-0 sm:shadow-none"
    >
      <span aria-live="polite" className="mr-2 text-sm text-muted-foreground">
        {count} selected
      </span>
      <Button variant="ghost" size="sm" onClick={onClear}>
        <XCircle className="mr-1 h-4 w-4" /> Clear
      </Button>
      <Button variant="outline" size="sm" onClick={onPublish}>
        <Upload className="mr-1 h-4 w-4" /> Publish
      </Button>
      <Button variant="outline" size="sm" onClick={onUnpublish}>
        <Archive className="mr-1 h-4 w-4" /> Unpublish
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="text-red-600"
        onClick={onDelete}
      >
        <Trash2 className="mr-1 h-4 w-4" /> Delete
      </Button>
    </div>
  )
}
