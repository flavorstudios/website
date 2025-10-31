export default function SettingsLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6 pb-24">
      <div className="space-y-2">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-4 w-80 animate-pulse rounded bg-muted/70" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="space-y-3 rounded-lg border border-border/40 bg-muted/10 p-4"
          >
            <div className="h-4 w-32 animate-pulse rounded bg-muted/80" />
            <div className="h-3 w-full animate-pulse rounded bg-muted/60" />
            <div className="h-3 w-3/4 animate-pulse rounded bg-muted/50" />
          </div>
        ))}
      </div>
    </div>
  )
}