"use client"
import { Button } from "@/components/ui/button"
import { Trash2, Tag as TagIcon, Download as DownloadIcon } from "lucide-react"

interface Props {
  count: number
  onDelete: () => void
  onTag: () => void
  onDownload: () => void
}

export default function MediaBulkActions({ count, onDelete, onTag, onDownload }: Props) {
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
      <Button variant="outline" size="sm" onClick={onDownload}>
        <DownloadIcon className="mr-1 h-4 w-4" /> Download
      </Button>
      <Button variant="outline" size="sm" onClick={onTag}>
        <TagIcon className="mr-1 h-4 w-4" /> Tag
      </Button>
      <Button variant="outline" size="sm" className="text-red-600" onClick={onDelete}>
        <Trash2 className="mr-1 h-4 w-4" /> Delete
      </Button>
    </div>
  )
}
