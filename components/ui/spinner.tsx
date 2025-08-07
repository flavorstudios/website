import { cn } from "@/lib/utils"

interface SpinnerProps {
  className?: string
}

export function Spinner({ className }: SpinnerProps) {
  return (
    <div className={cn("animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600", className)} />
  )
}

export default Spinner