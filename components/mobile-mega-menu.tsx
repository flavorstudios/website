"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, Coffee } from "lucide-react"
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

interface MobileMegaMenuProps {
  items: MenuItem[]
  onItemClick?: () => void
  className?: string
}

export function MobileMegaMenu({ items, onItemClick, className }: MobileMegaMenuProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const pathname = usePathname()

  const toggleExpanded = (label: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(label)) {
      newExpanded.delete(label)
    } else {
      newExpanded.add(label)
    }
    setExpandedItems(newExpanded)
  }

  const isActive = (href?: string) => {
    if (!href) return false
    if (href === "/" && pathname === "/") return true
    if (href !== "/" && pathname.startsWith(href)) return true
    return false
  }

  return (
    <div className={cn("space-y-1", className)} role="navigation" aria-label="Mobile menu">
      {items.map((item) => (
        <div key={item.label}>
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
                aria-controls={`mobile-submenu-${item.label}`}
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
                  id={`mobile-submenu-${item.label}`}
                  className={cn(
                    "overflow-hidden transition-all duration-300 ease-in-out",
                    expandedItems.has(item.label) ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
                  )}
                  role="region"
                  aria-label={`${item.label} submenu`}
                >
                  <div className="py-2 pl-4 space-y-1">
                    {item.subItems.map((subItem, index) => (
                      <Link
                        key={index}
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
      ))}

      {/* CTA Button */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <Link
          href="/support"
          className="flex items-center justify-center py-3 px-4 text-base font-medium text-white bg-orange-600 hover:bg-orange-700 transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          onClick={onItemClick}
        >
          <Coffee className="mr-2 h-5 w-5" />
          Buy Me a Coffee
        </Link>
      </div>
    </div>
  )
}
