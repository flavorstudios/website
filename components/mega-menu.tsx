"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export interface MenuItem {
  label: string
  href?: string
  subItems?: Array<{
    label: string
    href: string
    description?: string
  }>
}

interface MegaMenuProps {
  items: MenuItem[]
  className?: string
}

export function MegaMenu({ items, className }: MegaMenuProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleMouseEnter = (label: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setActiveMenu(label)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveMenu(null)
    }, 150)
  }

  const renderDropdown = (item: MenuItem) => {
    if (!item.subItems || item.subItems.length === 0) return null

    return (
      <div
        className={cn(
          "absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50",
          "min-w-[240px] py-2",
          "transform transition-all duration-200 ease-out",
          activeMenu === item.label ? "opacity-100 translate-y-0 visible" : "opacity-0 -translate-y-2 invisible",
        )}
        onMouseEnter={() => handleMouseEnter(item.label)}
        onMouseLeave={handleMouseLeave}
      >
        {item.subItems.map((subItem, index) => (
          <Link
            key={index}
            href={subItem.href}
            className={cn(
              "block px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600",
              "transition-colors duration-150 border-b border-gray-100 last:border-b-0",
            )}
            onClick={() => setActiveMenu(null)}
          >
            <div className="font-medium">{subItem.label}</div>
            {subItem.description && <div className="text-xs text-gray-500 mt-1">{subItem.description}</div>}
          </Link>
        ))}
      </div>
    )
  }

  return (
    <nav ref={menuRef} className={cn("flex items-center space-x-6", className)}>
      {items.map((item) => (
        <div
          key={item.label}
          className="relative"
          onMouseEnter={() => item.subItems && handleMouseEnter(item.label)}
          onMouseLeave={handleMouseLeave}
        >
          {item.href && !item.subItems ? (
            <Link href={item.href} className="text-sm font-medium transition-colors hover:text-blue-600">
              {item.label}
            </Link>
          ) : (
            <button
              className={cn(
                "flex items-center space-x-1 text-sm font-medium transition-colors hover:text-blue-600",
                activeMenu === item.label && "text-blue-600",
              )}
            >
              <span>{item.label}</span>
              {item.subItems && (
                <ChevronDown
                  className={cn("h-4 w-4 transition-transform duration-200", activeMenu === item.label && "rotate-180")}
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
