"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, Coffee, Sparkles, Grid3X3 } from "lucide-react"
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
    <div className="bg-gradient-to-b from-gray-50/80 to-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
      <nav className={cn("p-4", className)} aria-label="Mobile menu">
        {items.map((item, itemIndex) => (
          <div key={item.label} className="mb-2 last:mb-0">
            {/* Single link, no subItems */}
            {item.href && !item.subItems ? (
              <Link
                href={item.href}
                className={cn(
                  "flex items-center py-4 px-4 text-base font-medium rounded-xl transition-all duration-300 group relative overflow-hidden",
                  "hover:shadow-lg hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500/30",
                  isActive(item.href)
                    ? "text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg"
                    : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-gray-900",
                )}
                onClick={onItemClick}
                aria-current={isActive(item.href) ? "page" : undefined}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10">{item.label}</span>
              </Link>
            ) : (
              <>
                <button
                  className={cn(
                    "w-full flex items-center justify-between py-4 px-4 text-base font-medium rounded-xl transition-all duration-300 group relative overflow-hidden",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500/30 hover:shadow-lg hover:scale-[1.02]",
                    expanded === item.label
                      ? "text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg"
                      : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-gray-900",
                  )}
                  onClick={() => toggleExpanded(item.label)}
                  aria-expanded={expanded === item.label}
                  aria-controls={`mobile-submenu-${item.label}`}
                  type="button"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="flex items-center space-x-3 relative z-10">
                    <Grid3X3 className="w-5 h-5 opacity-70" />
                    <span>{item.label}</span>
                    {item.subItems && (
                      <span
                        className={cn(
                          "px-2.5 py-1 text-xs font-medium rounded-full transition-colors",
                          expanded === item.label
                            ? "bg-white/20 text-white"
                            : "bg-gray-100 text-gray-600 group-hover:bg-white/80",
                        )}
                      >
                        {item.subItems.length}
                      </span>
                    )}
                  </div>
                  {item.subItems && (
                    <ChevronDown
                      className={cn(
                        "h-5 w-5 transition-all duration-300 relative z-10",
                        expanded === item.label && "rotate-180",
                      )}
                      aria-hidden="true"
                    />
                  )}
                </button>

                {/* Enhanced Submenu with proper mobile scrolling */}
                {item.subItems && (
                  <div
                    id={`mobile-submenu-${item.label}`}
                    className={cn(
                      "overflow-hidden transition-all duration-500 ease-out",
                      expanded === item.label ? "opacity-100 mt-3" : "max-h-0 opacity-0",
                    )}
                    style={{
                      maxHeight: expanded === item.label ? "none" : "0px",
                    }}
                    role="region"
                    aria-label={`${item.label} submenu`}
                  >
                    {/* Fixed scrollable container for mobile */}
                    <div
                      className={cn(
                        "space-y-2",
                        item.label === "Blog" && "max-h-[50vh] overflow-y-auto mobile-elegant-scrollbar bg-gradient-to-b from-white/50 to-gray-50/80 rounded-2xl p-4 shadow-inner border border-gray-200/50 backdrop-blur-sm",
                        item.label === "Watch" && "max-h-[50vh] overflow-y-auto mobile-elegant-scrollbar bg-gradient-to-b from-white/50 to-gray-50/80 rounded-2xl p-4 shadow-inner border border-gray-200/50 backdrop-blur-sm",
                        item.label === "About" && "max-h-[120px] overflow-y-auto mobile-elegant-scrollbar bg-gradient-to-b from-white/50 to-gray-50/80 rounded-2xl p-4 shadow-inner border border-gray-200/50 backdrop-blur-sm"
                      )}
                      style={{
                        WebkitOverflowScrolling: "touch",
                        overscrollBehavior: "contain",
                      }}
                    >
                      {item.subItems.map((subItem, idx) => (
                        <Link
                          key={idx}
                          href={subItem.href}
                          className={cn(
                            "group flex items-start justify-between py-3.5 px-4 text-sm rounded-xl transition-all duration-300 relative overflow-hidden border border-transparent",
                            "hover:shadow-md hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-blue-500/30",
                            isActive(subItem.href)
                              ? "text-blue-700 bg-gradient-to-r from-blue-100/80 to-purple-100/80 shadow-md border-blue-200/50"
                              : "text-gray-600 hover:text-gray-900 hover:bg-white/80 hover:border-gray-200/50",
                          )}
                          onClick={onItemClick}
                          aria-current={isActive(subItem.href) ? "page" : undefined}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className="flex-1 min-w-0 relative z-10 pr-3">
                            <div className="flex items-start space-x-2 mb-1">
                              <div className="font-medium text-sm leading-tight">{subItem.label}</div>
                              {subItem.isNew && (
                                <div className="flex items-center space-x-1 flex-shrink-0">
                                  <Sparkles className="w-3 h-3 text-amber-500" />
                                  <span className="px-2 py-0.5 text-xs font-medium bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 rounded-full border border-amber-200">
                                    New
                                  </span>
                                </div>
                              )}
                            </div>
                            {subItem.description && (
                              <div className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors leading-relaxed">
                                {subItem.description}
                              </div>
                            )}
                          </div>
                          <div className="ml-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1 relative z-10 flex-shrink-0">
                            <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
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

        {/* Fixed CTA without blinking dot */}
        <div className="mt-6 pt-4 border-t border-gray-200/50">
          <Link
            href="/support"
            className="group flex items-center justify-center py-4 px-4 text-base font-medium text-white bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 hover:from-orange-600 hover:via-orange-700 hover:to-red-600 rounded-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500/30 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] relative overflow-hidden"
            onClick={onItemClick}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Coffee className="mr-3 h-5 w-5 relative z-10" />
            <span className="relative z-10">Buy Me a Coffee</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
