'use client'

export default function BlogTableSkeleton() {
  return (
    <div className="space-y-2" role="status" aria-label="Loading blog posts">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-12 w-full rounded bg-muted animate-pulse" />
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  )
}