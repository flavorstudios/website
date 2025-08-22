"use client"

import { Button } from "@/components/ui/button"

export function Pagination({
  currentPage,
  totalPages,
  totalCount,
  perPage = 10,
  onPageChange,
}: {
  currentPage: number
  totalPages?: number
  totalCount?: number
  perPage?: number
  onPageChange: (page: number) => void
}) {
  // Prefer a computed page count from totalCount/perPage; fall back to provided totalPages
  const computedTotalPages =
    typeof totalPages === "number" ? totalPages : Math.max(1, Math.ceil((totalCount ?? 0) / perPage))

  if (computedTotalPages <= 1) return null

  // Sliding window of up to 5 pages
  const pages = Array.from({ length: Math.min(computedTotalPages, 5) }, (_, i) => {
    if (computedTotalPages <= 5) return i + 1
    if (currentPage <= 3) return i + 1
    if (currentPage >= computedTotalPages - 2) return computedTotalPages - 4 + i
    return currentPage - 2 + i
  })

  return (
    <div className="flex items-center justify-center gap-2 my-4 flex-wrap">
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Go to previous page"
        title="Previous"
      >
        Previous
      </Button>

      {pages.map((p) => (
        <Button
          key={p}
          variant={p === currentPage ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange(p)}
          aria-label={`Go to page ${p}`}
        >
          {p}
        </Button>
      ))}

      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === computedTotalPages}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Go to next page"
        title="Next"
      >
        Next
      </Button>
    </div>
  )
}
