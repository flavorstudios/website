"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, Sparkles, Search } from "lucide-react"
import { cn } from "@/lib/utils"

export interface MenuItem {
  label: string
  href?: string
  subItems?: Array<{
    label: string
    href: string
    description?: string
    isNew?: boolean
  }>
}

interface MegaMenuProps {
  items: MenuItem[]
  className?: string
}

export function MegaMenu({ items, className }: MegaMenuProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const timeoutRef = useRef<NodeJS.Timeout>()
  const menuRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  // Debounced mouse enter handler
  const debouncedMouseEnter = useCallback((label: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setActiveMenu(label)
      setFocusedIndex(-1)
    }, 100)
  }, [])

  const handleMouseLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setActiveMenu(null)
      setFocusedIndex(-1)
    }, 200)
  }, [])

  // Enhanced keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, item: MenuItem, index: number) => {
      switch (e.key) {
        case "Enter":
        case " ":
          e.preventDefault()
          if (item.subItems) {
            setActiveMenu(activeMenu === item.label ? null : item.label)
          } else if (item.href) {
            window.location.href = item.href
          }
          break
        case "ArrowDown":
          e.preventDefault()
          if (item.subItems && activeMenu === item.label) {
            setFocusedIndex(0)
          } else {
            setActiveMenu(item.label)
            setFocusedIndex(0)
          }
          break
        case "ArrowUp":
          e.preventDefault()
          if (focusedIndex > 0) setFocusedIndex(focusedIndex - 1)
          break
        case "ArrowRight":
          e.preventDefault()
          {
            const nextIndex = (index + 1) % items.length
            const nextButton = menuRef.current?.querySelectorAll('[role="menuitem"]')[nextIndex] as HTMLElement
            nextButton?.focus()
          }
          break
        case "ArrowLeft":
          e.preventDefault()
          {
            const prevIndex = index === 0 ? items.length - 1 : index - 1
            const prevButton = menuRef.current?.querySelectorAll('[role="menuitem"]')[prevIndex] as HTMLElement
            prevButton?.focus()
          }
          break
        case "Escape":
          setActiveMenu(null)
          setFocusedIndex(-1)
          break
      }
    },
    [activeMenu, focusedIndex, items.length],
  )

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null)
        setFocusedIndex(-1)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Check if current path matches menu item
  const isActive = (href?: string) => {
    if (!href) return false
    if (href === "/" && pathname === "/") return true
    if (href !== "/" && pathname.startsWith(href)) return true
    return false
  }

  // Clean dropdown design without extra spacing
  const renderDropdown = (item: MenuItem) => {
    if (!item.subItems || item.subItems.length === 0) return null

    const isScrollableMenu = item.label === "Blog" || item.label === "Watch"

    return (
      <div
        className={cn(
          "absolute top-full left-0 mt-2 bg-gradient-to-b from-gray-50/95 to-white/95 backdrop-blur-xl border border-gray-200/50 z-50 min-w-[320px] rounded-2xl shadow-2xl overflow-hidden",
          "transform transition-all duration-300 ease-out",
          activeMenu === item.label
            ? "opacity-100 translate-y-0 visible scale-100"
            : "opacity-0 -translate-y-4 invisible scale-95",
          isScrollableMenu && "max-h-[75vh]",
        )}
        role="menu"
        aria-label={`${item.label} submenu`}
        onMouseEnter={() => debouncedMouseEnter(item.label)}
        onMouseLeave={handleMouseLeave}
      >
        <div className={cn("p-4", isScrollableMenu ? "overflow-y-auto elegant-scrollbar max-h-[75vh]" : "")}>
          {item.subItems.map((subItem, index) => (
            <Link
              key={index}
              href={subItem.href}
              role="menuitem"
              tabIndex={focusedIndex === index ? 0 : -1}
              className={cn(
                "group flex items-center justify-between py-3.5 px-4 text-sm rounded-xl transition-all duration-300 relative overflow-hidden mb-2 last:mb-0 border border-transparent",
                "hover:shadow-md hover:scale-[1.02] hover:bg-white/80 hover:border-gray-200/50",
                "focus:bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-gray-200/50",
                isActive(subItem.href) &&
                  "text-blue-700 bg-gradient-to-r from-blue-100/80 to-purple-100/80 shadow-md border-blue-200/50",
                focusedIndex === index && "bg-white/80 border-gray-200/50",
              )}
              onClick={() => {
                setActiveMenu(null)
                setFocusedIndex(-1)
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  window.location.href = subItem.href
                }
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="flex-1 min-w-0 relative z-10">
                <div className="flex items-center space-x-2">
                  <div
                    className={cn(
                      "font-medium transition-colors truncate",
                      isActive(subItem.href) ? "text-blue-700" : "text-gray-900 group-hover:text-gray-900",
                    )}
                  >
                    {subItem.label}
                  </div>
                  {subItem.isNew && (
                    <div className="flex items-center space-x-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span className="px-2 py-0.5 text-xs font-medium bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 rounded-full border border-amber-200">
                        New
                      </span>
                    </div>
                  )}
                </div>
                {subItem.description && (
                  <div className="text-xs text-gray-500 mt-1 group-hover:text-gray-600 transition-colors truncate">
                    {subItem.description}
                  </div>
                )}
              </div>
              <div className="ml-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1 relative z-10">
                <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    )
  }

  return (
    <nav ref={menuRef} className={cn("flex items-center space-x-4", className)} role="menubar">
      {items.map((item, index) => (
        <div
          key={item.label}
          className="relative"
          onMouseEnter={() => item.subItems && debouncedMouseEnter(item.label)}
          onMouseLeave={handleMouseLeave}
        >
          {item.href && !item.subItems ? (
            <Link
              href={item.href}
              role="menuitem"
              className={cn(
                "flex items-center py-2 px-3 text-sm font-medium rounded-xl transition-all duration-300 group relative overflow-hidden",
                "hover:shadow-lg hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500/30",
                isActive(item.href)
                  ? "text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg"
                  : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-gray-900",
              )}
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10">{item.label}</span>
            </Link>
          ) : (
            <button
              role="menuitem"
              aria-haspopup="true"
              aria-expanded={activeMenu === item.label}
              className={cn(
                "flex items-center space-x-2 py-2 px-3 text-sm font-medium rounded-xl transition-all duration-300 group relative overflow-hidden",
                "focus:outline-none focus:ring-2 focus:ring-blue-500/30 hover:shadow-lg hover:scale-[1.02]",
                activeMenu === item.label
                  ? "text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg"
                  : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-gray-900",
              )}
              onKeyDown={(e) => handleKeyDown(e, item, index)}
              tabIndex={0}
              aria-label={item.label}
              type="button"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10">{item.label}</span>
              {item.subItems && (
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-all duration-300 relative z-10",
                    activeMenu === item.label && "rotate-180",
                  )}
                  aria-hidden="true"
                />
              )}
            </button>
          )}
          {renderDropdown(item)}
        </div>
      ))}

      {/* Enhanced Search Icon */}
      <div className="flex items-center space-x-3 ml-4">
        <button className="group relative p-2.5 rounded-xl bg-gradient-to-r from-gray-100 to-gray-50 hover:from-blue-50 hover:to-purple-50 transition-all duration-300 hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500/30">
          <Search className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors duration-300" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
      </div>
    </nav>
  )
}
