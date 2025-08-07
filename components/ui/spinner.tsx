import { cn } from "@/lib/utils"

interface SpinnerProps {
  className?: string
}

export function Spinner({ className }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      aria-live="polite"
      className={cn("flex items-center justify-center", className)}
    >
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      <span className="sr-only">Loading...</span>
    </div>
  )
}

export default Spinner
