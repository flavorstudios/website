"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Contrast } from "lucide-react"

export function HighContrastToggle() {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle("high-contrast", enabled)
  }, [enabled])

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setEnabled(!enabled)}
      aria-label="Toggle high contrast mode"
      className="focus:outline-none focus:ring"
    >
      <Contrast className="h-4 w-4" />
    </Button>
  )
}

export default HighContrastToggle