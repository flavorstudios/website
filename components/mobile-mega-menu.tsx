"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import type { MenuItem } from "./mega-menu"

interface MobileMegaMenuProps {
  items: MenuItem[]
  onItemClick?: () => void
  className?: string
  loading?: boolean
}

export function MobileMegaMenu({ items, onItemClick, className, loading }: MobileMegaMenuProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const pathname = usePathname()

  const toggleExpanded = (label: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev)
      if (next.has(label)) {
        next.delete(label)
      } else {
        next.add(label)
      }
      return next
    })
  }

  const isActive = (href?: string) => {
    if (!href) return false
    if (href === "/" && pathname === "/") return true
    if (href !== "/" && pathname.startsWith(href)) return true
    return false
  }

  if (loading) {
    return (
      <div className={cn("space-y-1", className)}>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-10 w-full bg-gray-200 animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className={cn("space-y-1", className)} role="navigation" aria-label="Mobile menu">
      {items.map((item) => {
        const key = item.href || item.label
        return (
          <div key={key}>
            {item.href && !item.subItems ? (
              <Link
                href={item.href}
                className={cn(
                  "flex items-center py-3 px-4 text-base font-medium transition-colors rounded-lg",
                  "hover:text-blue-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500",
                  isActive(item.href) ? "text-blue-600 bg-blue-50" : "text-gray-700",
                )}
                onClick={onItemClick}
                aria-current={isActive(item.href) ? "page" : undefined}
              >
                {item.label}
              </Link>
            ) : (
              <>
                <button
                  className={cn(
                    "w-full flex items-center justify-between py-3 px-4 text-base font-medium",
                    "transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500",
                    "hover:text-blue-600 hover:bg-gray-50",
                    expandedItems.has(item.label) ? "text-blue-600 bg-blue-50" : "text-gray-700",
                  )}
                  onClick={() => toggleExpanded(item.label)}
                  aria-expanded={expandedItems.has(item.label)}
                  aria-controls={`mobile-submenu-${key}`}
                  aria-label={`${item.label} menu`}
                >
                  <span>{item.label}</span>
                  {item.subItems && (
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        expandedItems.has(item.label) && "rotate-180",
                      )}
                      aria-hidden="true"
                    />
                  )}
                </button>
                {item.subItems && (
                  <div
                    id={`mobile-submenu-${key}`}
                    className={cn(
                      "overflow-hidden transition-all duration-300 ease-in-out",
                      expandedItems.has(item.label) ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
                    )}
                    role="region"
                    aria-label={`${item.label} submenu`}
                    aria-labelledby={`mobile-submenu-${key}`}
                  >
                    <div className="py-2 pl-4 space-y-1">
                      {item.subItems.map((subItem, index) => (
                        <Link
                          key={subItem.href || subItem.label}
                          href={subItem.href}
                          className={cn(
                            "block py-2 px-4 text-sm transition-colors rounded",
                            "hover:text-blue-600 hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500",
                            isActive(subItem.href) ? "text-blue-600 bg-white" : "text-gray-600",
                          )}
                          onClick={onItemClick}
                          aria-current={isActive(subItem.href) ? "page" : undefined}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{subItem.label}</div>
                              {subItem.description && (
                                <div className="text-xs text-gray-500 mt-1">{subItem.description}</div>
                              )}
                            </div>
                            {subItem.isNew && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                New
                              </span>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}
