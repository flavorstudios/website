"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const isDark = mounted && theme === "dark"

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark")
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      aria-pressed={isDark}
      title={`Toggle theme (currently ${isDark ? "dark" : "light"})`}
      className="focus:outline-none focus:ring"
    >
      {isDark ? (
        <Sun className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4" aria-hidden="true" />
      )}
      <span className="sr-only">
        Switch to {isDark ? "light" : "dark"} theme
      </span>
    </Button>
  )
}

export default ThemeToggle
