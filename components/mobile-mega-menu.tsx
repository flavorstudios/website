"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, Coffee } from "lucide-react"
import { cn } from "@/lib/utils"
import type { MenuItem } from "./mega-menu"

interface MobileMegaMenuProps {
  items: MenuItem[]
  onItemClick?: () => void
  className?: string
}

export function MobileMegaMenu({ items, onItemClick, className }: MobileMegaMenuProps) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const pathname = usePathname()

  const toggleExpanded = (label: string) => {
    setExpanded(expanded === label ? null : label)
  }

  // Checks if a menu item's link matches the current path
  const isActive = (href?: string) => {
    if (!href) return false
    if (href === "/" && pathname === "/") return true
    if (href !== "/" && pathname.startsWith(href)) return true
    return false
  }

  return (
    <nav className={cn("space-y-1", className)} aria-label="Mobile menu">
      {items.map((item) => (
        <div key={item.label}>
          {/* Single link, no subItems */}
          {item.href && !item.subItems ? (
            <Link
              href={item.href}
              className={cn(
                "flex items-center py-3 px-4 text-base font-medium rounded-lg transition-colors",
                "hover:text-blue-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500",
                isActive(item.href) ? "text-blue-600 bg-blue-50" : "text-gray-700"
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
                  "w-full flex items-center justify-between py-3 px-4 text-base font-medium rounded-lg transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500 hover:text-blue-600 hover:bg-gray-50",
                  expanded === item.label ? "text-blue-600 bg-blue-50" : "text-gray-700"
                )}
                onClick={() => toggleExpanded(item.label)}
                aria-expanded={expanded === item.label}
                aria-controls={`mobile-submenu-${item.label}`}
                type="button"
              >
                <span>{item.label}</span>
                {item.subItems && (
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      expanded === item.label && "rotate-180"
                    )}
                    aria-hidden="true"
                  />
                )}
              </button>
              {/* Submenu */}
              {item.subItems && (
                <div
                  id={`mobile-submenu-${item.label}`}
                  className={cn(
                    "overflow-hidden transition-all duration-300 ease-in-out",
                    expanded === item.label ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  )}
                  role="region"
                  aria-label={`${item.label} submenu`}
                >
                  <div className="py-2 pl-4 space-y-1">
                    {item.subItems.map((subItem, idx) => (
                      <Link
                        key={idx}
                        href={subItem.href}
                        className={cn(
                          "block py-2 px-4 text-sm rounded transition-colors",
                          "hover:text-blue-600 hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500",
                          isActive(subItem.href) ? "text-blue-600 bg-white" : "text-gray-600"
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
      ))}
      {/* CTA */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <Link
          href="/support"
          className="flex items-center justify-center py-3 px-4 text-base font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
          onClick={onItemClick}
        >
          <Coffee className="mr-2 h-5 w-5" />
          Buy Me a Coffee
        </Link>
      </div>
    </nav>
  )
}
