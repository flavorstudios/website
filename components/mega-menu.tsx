"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown } from "lucide-react"
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

  // Enhanced dropdown with professional styling
  const renderDropdown = (item: MenuItem) => {
    if (!item.subItems || item.subItems.length === 0) return null

    const isScrollableMenu = item.label === "Blog" || item.label === "Watch"

    return (
      <div
        className={cn(
          "absolute top-full left-0 mt-2 bg-white border border-gray-100 z-50 min-w-[320px] rounded-xl shadow-2xl backdrop-blur-sm",
          "transform transition-all duration-300 ease-out",
          activeMenu === item.label
            ? "opacity-100 translate-y-0 visible scale-100"
            : "opacity-0 -translate-y-3 invisible scale-95",
          isScrollableMenu && "max-h-[70vh]",
        )}
        role="menu"
        aria-label={`${item.label} submenu`}
        onMouseEnter={() => debouncedMouseEnter(item.label)}
        onMouseLeave={handleMouseLeave}
      >
        {/* Header for scrollable menus */}
        {isScrollableMenu && (
          <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-t-xl">
            <h3 className="font-semibold text-gray-900 text-sm">{item.label} Categories</h3>
            <p className="text-xs text-gray-600 mt-1">{item.subItems.length} categories available</p>
          </div>
        )}

        {/* Scrollable content area */}
        <div
          className={cn(
            isScrollableMenu ? "overflow-y-auto professional-scrollbar p-2" : "py-2",
            isScrollableMenu && "max-h-[calc(70vh-80px)]",
          )}
        >
          {item.subItems.map((subItem, index) => (
            <Link
              key={index}
              href={subItem.href}
              role="menuitem"
              tabIndex={focusedIndex === index ? 0 : -1}
              className={cn(
                "group block px-4 py-3 text-sm transition-all duration-200 rounded-lg mx-1 my-0.5",
                "hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:shadow-sm",
                "focus:bg-gradient-to-r focus:from-blue-50 focus:to-cyan-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20",
                isActive(subItem.href) && "bg-blue-50 text-blue-600 shadow-sm",
                focusedIndex === index && "bg-gradient-to-r from-blue-50 to-cyan-50",
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
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div
                    className={cn(
                      "font-medium transition-colors",
                      isActive(subItem.href) ? "text-blue-600" : "text-gray-900 group-hover:text-gray-900",
                    )}
                  >
                    {subItem.label}
                    {subItem.isNew && (
                      <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 rounded-full border border-blue-200">
                        New
                      </span>
                    )}
                  </div>
                  {subItem.description && (
                    <div className="text-xs text-gray-500 mt-1 group-hover:text-gray-600 transition-colors">
                      {subItem.description}
                    </div>
                  )}
                </div>
                <div className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer for scrollable menus */}
        {isScrollableMenu && (
          <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 rounded-b-xl">
            <p className="text-xs text-gray-500 text-center">Scroll to see all {item.label.toLowerCase()} categories</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <nav ref={menuRef} className={cn("flex items-center space-x-6", className)} role="menubar">
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
                "text-sm font-medium transition-all duration-200 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md px-3 py-2",
                isActive(item.href) && "text-blue-600 bg-blue-50",
              )}
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              {item.label}
            </Link>
          ) : (
            <button
              role="menuitem"
              aria-haspopup="true"
              aria-expanded={activeMenu === item.label}
              className={cn(
                "flex items-center space-x-1 text-sm font-medium transition-all duration-200 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md px-3 py-2",
                activeMenu === item.label && "text-blue-600 bg-blue-50",
              )}
              onKeyDown={(e) => handleKeyDown(e, item, index)}
              tabIndex={0}
              aria-label={item.label}
              type="button"
            >
              <span>{item.label}</span>
              {item.subItems && (
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-all duration-300",
                    activeMenu === item.label && "rotate-180 text-blue-600",
                  )}
                  aria-hidden="true"
                />
              )}
            </button>
          )}
          {renderDropdown(item)}
        </div>
      ))}
    </nav>
  )
}
