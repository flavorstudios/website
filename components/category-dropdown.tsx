"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

type CategoryDropdownProps = {
  title: string
  categories: Record<string, { heading: string }>
  baseUrl: string
  className?: string
}

export function CategoryDropdown({ title, categories, baseUrl, className }: CategoryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

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
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn("nav-link gradient-border flex items-center", isOpen && "text-primary", className)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {title}
        <ChevronDown className={cn("ml-1 h-4 w-4 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-56 rounded-md border bg-background/95 backdrop-blur-md shadow-lg z-50 py-1 animate-in fade-in-50 slide-in-from-top-5">
          {Object.entries(categories).map(([slug, category]) => (
            <Link
              key={slug}
              href={`${baseUrl}/${slug}`}
              className="block px-4 py-2 text-sm hover:bg-primary/10 hover:text-primary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {category.heading}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
