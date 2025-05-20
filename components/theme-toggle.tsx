"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Sun, Moon } from "lucide-react"

export function ThemeToggle() {
  // Use a ref to track if the component is mounted
  const mounted = React.useRef(false)
  const { theme, setTheme } = useTheme()

  // Set mounted to true after the component mounts
  React.useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  // Simple toggle function with error handling
  const toggleTheme = React.useCallback(() => {
    try {
      setTheme(theme === "dark" ? "light" : "dark")
    } catch (error) {
      console.error("Theme toggle error:", error)
    }
  }, [theme, setTheme])

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted.current) {
    return null
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
      {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
