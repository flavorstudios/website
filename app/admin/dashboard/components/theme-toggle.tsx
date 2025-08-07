"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Sun, Moon, Laptop } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // On mount, restore theme from localStorage (if available)
    const stored = localStorage.getItem("theme")
    if (stored) setTheme(stored)
    setMounted(true)
  }, [setTheme])

  if (!mounted) return null

  const currentTheme = theme === "system" ? resolvedTheme : theme

  const handleSelect = (value: string) => {
    setTheme(value)
    localStorage.setItem("theme", value)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label="Toggle theme"
          className="relative"
        >
          {currentTheme === "dark" ? (
            <Moon className="h-5 w-5" />
          ) : currentTheme === "light" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Laptop className="h-5 w-5" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => handleSelect("light")}
          aria-selected={currentTheme === "light"}
        >
          <Sun className="mr-2 h-4 w-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleSelect("dark")}
          aria-selected={currentTheme === "dark"}
        >
          <Moon className="mr-2 h-4 w-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleSelect("system")}
          aria-selected={theme === "system"}
        >
          <Laptop className="mr-2 h-4 w-4" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
