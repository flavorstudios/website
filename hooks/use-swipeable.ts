import { useEffect, useRef } from "react"

interface Options {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  threshold?: number
  enabled?: boolean
}

export function useSwipeable({
  onSwipeLeft,
  onSwipeRight,
  threshold = 50,
  enabled = true,
}: Options) {
  const startX = useRef<number | null>(null)

  useEffect(() => {
    if (!enabled) return

    const handleTouchStart = (e: TouchEvent) => {
      startX.current = e.touches[0].clientX
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (startX.current === null) return
      const deltaX = e.changedTouches[0].clientX - startX.current
      if (deltaX > threshold && startX.current < 50) {
        onSwipeRight?.()
      } else if (deltaX < -threshold) {
        onSwipeLeft?.()
      }
      startX.current = null
    }

    window.addEventListener("touchstart", handleTouchStart)
    window.addEventListener("touchend", handleTouchEnd)
    return () => {
      window.removeEventListener("touchstart", handleTouchStart)
      window.removeEventListener("touchend", handleTouchEnd)
    }
  }, [enabled, onSwipeLeft, onSwipeRight, threshold])
}