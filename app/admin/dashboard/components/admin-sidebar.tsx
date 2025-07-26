"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FileText,
  Video,
  MessageSquare,
  Edit,
  Settings,
  ChevronLeft,
  ChevronRight,
  Mail,
  Users,
} from "lucide-react"
import { useRole } from "../contexts/role-context"
import { useState, useEffect } from "react"

interface AdminSidebarProps {
  activeSection: string
  setActiveSection: (section: string) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function AdminSidebar({
  activeSection,
  activeSection: _activeSection,
  setActiveSection,
  sidebarOpen,
  setSidebarOpen,
}: AdminSidebarProps) {
  // --- FIX: remove userRole destructure as per Codex audit ---
  const { accessibleSections } = useRole()
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()

  // Only one menu item per section, with `href` for route navigation
  const menuItems = [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard, count: null, href: "/admin/dashboard" },
    { id: "blogs", label: "Blog Posts", icon: FileText, count: null, href: "/admin/dashboard/blog-posts" },
    { id: "videos", label: "Videos", icon: Video, count: null },
    { id: "categories", label: "Categories", icon: Edit, count: null },
    { id: "comments", label: "Comments", icon: MessageSquare, count: null },
    { id: "inbox", label: "Email Inbox", icon: Mail, count: null },
    { id: "users", label: "Users", icon: Users, count: null },
    { id: "settings", label: "Settings", icon: Settings, count: null },
  ]

  // Show only accessible sections and always the dashboard
  const filteredNavItems = menuItems.filter(
    (item) => accessibleSections.includes(item.id) || item.id === "overview"
  )

  // Codex audit: Longest prefix active item logic
  const activeHrefItem = filteredNavItems
    .filter(
      (item) =>
        item.href &&
        (pathname === item.href || pathname.startsWith(`${item.href}/`)),
    )
    .sort((a, b) => (b.href!.length - a.href!.length))[0]

  const isActive = (href?: string) => {
    if (!href) return false
    return href === activeHrefItem?.href
  }

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          bg-white border-r border-gray-200 fixed left-0 top-0 h-screen overflow-y-auto z-50
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          w-64 md:translate-x-0 ${sidebarOpen ? "md:w-64" : "md:w-20"}
          flex flex-col md:relative md:z-auto
        `}
      >
        {/* Sidebar Header */}
        <div className={`${sidebarOpen ? "p-4" : "p-2"} border-b border-gray-200 min-h-[80px] flex items-center`}>
          <div className="flex items-center justify-between w-full">
            {sidebarOpen ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">FS</span>
                </div>
                <div className="min-w-0">
                  <span className="font-semibold text-gray-900 text-sm block truncate">Admin Panel</span>
                  <span className="text-xs text-gray-500 block truncate">Flavor Studios</span>
                </div>
              </div>
            ) : (
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center mx-auto">
                <span className="text-white font-bold text-xs">FS</span>
              </div>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden md:flex p-1 h-8 w-8"
              aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              {sidebarOpen ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* User Info */}
        {sidebarOpen && (
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="font-medium text-gray-900 text-sm">Administrator</p>
            <p className="text-xs text-gray-500">Manage your studio</p>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="flex-1 p-2 overflow-y-auto">
          <div className="space-y-1">
            {filteredNavItems.map((item) => {
              const active = isActive(item.href)
              const Icon = item.icon

              // If href is present, use Link (route navigation).
              if (item.href) {
                return (
                  <Button
                    key={item.id}
                    asChild
                    variant={active ? "default" : "ghost"}
                    className={`w-full ${
                      sidebarOpen ? "justify-start px-3" : "justify-center px-0"
                    } h-10 ${
                      active
                        ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    title={!sidebarOpen ? item.label : undefined}
                    onClick={isMobile ? () => setSidebarOpen(false) : undefined}
                  >
                    <Link href={item.href} className="flex items-center w-full">
                      <Icon className={`h-5 w-5 flex-shrink-0 ${sidebarOpen ? "mr-3" : ""}`} />
                      {sidebarOpen && (
                        <>
                          <span className="flex-1 text-left text-sm truncate">{item.label}</span>
                          {item.count && (
                            <Badge
                              variant="secondary"
                              className={`ml-2 text-xs ${
                                active ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"
                              }`}
                            >
                              {item.count}
                            </Badge>
                          )}
                        </>
                      )}
                    </Link>
                  </Button>
                )
              }

              // Section only (no href), never highlighted
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  className={`w-full ${
                    sidebarOpen ? "justify-start px-3" : "justify-center px-0"
                  } h-10 text-gray-700 hover:bg-gray-100`}
                  onClick={() => {
                    setActiveSection(item.id)
                    if (isMobile) setSidebarOpen(false)
                  }}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <Icon className={`h-5 w-5 flex-shrink-0 ${sidebarOpen ? "mr-3" : ""}`} />
                  {sidebarOpen && (
                    <>
                      <span className="flex-1 text-left text-sm truncate">{item.label}</span>
                      {item.count && (
                        <Badge
                          variant="secondary"
                          className="ml-2 text-xs bg-gray-200 text-gray-700"
                        >
                          {item.count}
                        </Badge>
                      )}
                    </>
                  )}
                </Button>
              )
            })}
          </div>
        </nav>

        {/* Sidebar Footer */}
        {sidebarOpen && (
          <div className="p-4 border-t border-gray-200 mt-auto">
            <div className="text-xs text-gray-500 text-center">
              <p className="font-medium">Flavor Studios Admin</p>
              <p>Version 1.0.0</p>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
