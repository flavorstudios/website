"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface StickySaveBarProps {
  isDirty: boolean
  isSubmitting?: boolean
  onSave: () => void
  onReset: () => void
  saveLabel?: string
  resetLabel?: string
  className?: string
}

export function StickySaveBar({
  isDirty,
  isSubmitting,
  onSave,
  onReset,
  saveLabel = "Save",
  resetLabel = "Reset",
  className,
}: StickySaveBarProps) {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault()
        if (!isDirty || isSubmitting) return
        onSave()
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [isDirty, isSubmitting, onSave])

  if (!isDirty && !isSubmitting) return null

  return (
    <div
      className={cn(
        "sticky bottom-4 z-50 flex items-center justify-between gap-4 rounded-full border bg-background/95 px-4 py-2 shadow-lg backdrop-blur",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>{isSubmitting ? "Saving changes…" : "Unsaved changes"}</span>
        <Separator orientation="vertical" className="h-6" />
        <span className="hidden sm:inline">Press ⌘/Ctrl + S to save</span>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onReset} disabled={isSubmitting}>
          {resetLabel}
        </Button>
        <Button onClick={onSave} disabled={!isDirty || !!isSubmitting}>
          {isSubmitting ? "Saving" : saveLabel}
        </Button>
      </div>
    </div>
  )
}