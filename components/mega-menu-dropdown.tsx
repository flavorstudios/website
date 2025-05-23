"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

type MegaMenuCategory = {
  name: string
  href: string
  description?: string
}

type MegaMenuProps = {
  title: string
  menuTitle: string
  mainRoute: string
  categories: MegaMenuCategory[]
  className?: string
}

export function MegaMenuDropdown({ title, menuTitle, mainRoute, categories, className }: MegaMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()
  const pathname = usePathname()

  const isActive = pathname === mainRoute || pathname.startsWith(`${mainRoute}/`)

  // Handle mouse enter with slight delay
  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsHovered(true)
    timeoutRef.current = setTimeout(() => {
      setIsOpen(true)
    }, 150)
  }

  // Handle mouse leave with delay to prevent flickering
  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsHovered(false)
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false)
    }, 300)
  }

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

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case "Enter":
      case " ":
        event.preventDefault()
        setIsOpen(!isOpen)
        break
      case "Escape":
        setIsOpen(false)
        break
      case "ArrowDown":
        if (!isOpen) {
          event.preventDefault()
          setIsOpen(true)
        }
        break
    }
  }

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="relative" ref={dropdownRef} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <div className="flex items-center">
        <Link
          href={mainRoute}
          className={cn(
            "relative px-4 py-2.5 text-sm font-medium tracking-wide transition-all duration-300 rounded-lg hover:bg-primary/8 hover:text-primary",
            isActive &&
              "text-primary bg-primary/10 after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:bg-primary after:rounded-full",
            className,
          )}
        >
          {title}
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          className="ml-1 p-1 rounded-md hover:bg-primary/8 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
          aria-expanded={isOpen}
          aria-haspopup="true"
          aria-label={`Toggle ${title} menu`}
        >
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-all duration-300",
              isOpen || isHovered ? "rotate-180 text-primary" : "text-muted-foreground",
            )}
          />
        </button>
      </div>

      {/* Mega Menu Dropdown with Animation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 md:left-1/2 md:-translate-x-1/2 top-full mt-2 w-[calc(100vw-2rem)] md:w-screen max-w-md z-50"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby={`${title.toLowerCase()}-menu-button`}
          >
            <div className="bg-background/98 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl shadow-black/20 p-4 md:p-6 overflow-hidden">
              {/* Menu Title */}
              <div className="mb-3 pb-2 border-b border-border/30">
                <h3 className="text-lg font-semibold font-orbitron text-foreground">{menuTitle}</h3>
              </div>

              {/* Categories Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 max-h-[60vh] md:max-h-[50vh] overflow-y-auto custom-scrollbar pr-1">
                {categories.length > 0 ? (
                  categories.map((category, index) => (
                    <Link
                      key={category.href}
                      href={category.href}
                      className="group p-2 md:p-3 rounded-lg hover:bg-primary/8 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      role="menuitem"
                      tabIndex={isOpen ? 0 : -1}
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-300">
                        {category.name}
                      </div>
                      {category.description && (
                        <div className="text-xs text-muted-foreground mt-1 line-clamp-2 group-hover:text-muted-foreground/80 transition-colors duration-300">
                          {category.description}
                        </div>
                      )}
                    </Link>
                  ))
                ) : (
                  <div className="col-span-2 p-3 text-sm text-muted-foreground">No categories yet.</div>
                )}
              </div>

              {/* View All Link */}
              <div className="mt-3 pt-2 border-t border-border/30">
                <Link
                  href={mainRoute}
                  className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors duration-300"
                  onClick={() => setIsOpen(false)}
                >
                  View All {title}
                  <ChevronDown className="ml-1 h-3 w-3 -rotate-90" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
