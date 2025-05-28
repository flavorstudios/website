"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import type { MenuItem } from "./mega-menu"

interface MobileMegaMenuProps {
  items: MenuItem[]
  onItemClick?: () => void
  className?: string
}

export function MobileMegaMenu({ items, onItemClick, className }: MobileMegaMenuProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const toggleExpanded = (label: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(label)) {
      newExpanded.delete(label)
    } else {
      newExpanded.add(label)
    }
    setExpandedItems(newExpanded)
  }

  return (
    <div className={cn("space-y-1", className)}>
      {items.map((item) => (
        <div key={item.label}>
          {item.href && !item.subItems ? (
            <Link
              href={item.href}
              className="flex items-center py-3 px-4 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors"
              onClick={onItemClick}
            >
              {item.label}
            </Link>
          ) : (
            <>
              <button
                className={cn(
                  "w-full flex items-center justify-between py-3 px-4 text-base font-medium",
                  "text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors",
                  expandedItems.has(item.label) && "text-blue-600 bg-blue-50",
                )}
                onClick={() => toggleExpanded(item.label)}
              >
                <span>{item.label}</span>
                {item.subItems && (
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      expandedItems.has(item.label) && "rotate-180",
                    )}
                  />
                )}
              </button>
              {item.subItems && (
                <div
                  className={cn(
                    "overflow-hidden transition-all duration-300 ease-in-out",
                    expandedItems.has(item.label) ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
                  )}
                >
                  <div className="py-2 pl-4 space-y-1">
                    {item.subItems.map((subItem, index) => (
                      <Link
                        key={index}
                        href={subItem.href}
                        className="block py-2 px-4 text-sm text-gray-600 hover:text-blue-600 hover:bg-white rounded transition-colors"
                        onClick={onItemClick}
                      >
                        <div className="font-medium">{subItem.label}</div>
                        {subItem.description && <div className="text-xs text-gray-500 mt-1">{subItem.description}</div>}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  )
}
