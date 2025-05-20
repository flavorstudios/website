"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

type CategoryDropdownProps = {
  title: string
  mainRoute: string
  categories: Record<string, { heading: string }>
  baseUrl: string
  className?: string
}

export function CategoryDropdown({ title, mainRoute, categories, baseUrl, className }: CategoryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  const isActive = pathname === mainRoute || pathname.startsWith(`${baseUrl}/`)
  const isActiveExact = pathname === mainRoute

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div
      className="relative"
      ref={dropdownRef}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <div className="flex items-center">
        <Link
          href={mainRoute}
          className={cn(
            "nav-link gradient-border flex items-center",
            isActive && "text-primary",
            isActiveExact && "font-medium",
            className,
          )}
          onClick={(e) => {
            // Allow the link to navigate normally
            setIsOpen(false)
          }}
        >
          {title}
        </Link>
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setIsOpen(!isOpen)
          }}
          className="ml-1 p-1 focus:outline-none"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute left-0 mt-1 w-56 rounded-md border bg-background/95 backdrop-blur-md shadow-lg z-50 py-1 animate-in fade-in-50 slide-in-from-top-5">
          {Object.entries(categories).map(([slug, category]) => {
            const categoryUrl = `${baseUrl}/${slug}`
            const isCategoryActive = pathname === categoryUrl

            return (
              <Link
                key={slug}
                href={categoryUrl}
                className={cn(
                  "block px-4 py-2 text-sm hover:bg-primary/10 hover:text-primary transition-colors",
                  isCategoryActive && "bg-primary/5 text-primary font-medium",
                )}
                onClick={() => setIsOpen(false)}
              >
                {category.heading}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
