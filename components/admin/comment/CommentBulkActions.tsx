"use client"
import { Button } from '@/components/ui/button'
import { Check, X, Trash2, Download, Flag } from 'lucide-react

export interface CommentBulkActionsProps {
  count: number
  onApprove: () => void
  onSpam: () => void
  onDelete: () => void
  onExport?: () => void
  onFlag?: () => void
}

export default function CommentBulkActions({
  count,
  onApprove,
  onSpam,
  onDelete,
  onExport,
  onFlag,
}: CommentBulkActionsProps) {
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
      <Button variant="outline" size="sm" onClick={onApprove}>
        <Check className="mr-1 h-4 w-4" /> Approve
      </Button>
      <Button variant="outline" size="sm" onClick={onSpam}>
        <X className="mr-1 h-4 w-4" /> Spam
      </Button>
      {onFlag && (
        <Button variant="outline" size="sm" onClick={onFlag}>
          <Flag className="mr-1 h-4 w-4" /> Flag
        </Button>
      )}
      {onExport && (
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="mr-1 h-4 w-4" /> Export
        </Button>
      )}
      <Button variant="outline" size="sm" className="text-red-600" onClick={onDelete}>
        <Trash2 className="mr-1 h-4 w-4" /> Delete
      </Button>
    </div>
  )
}
