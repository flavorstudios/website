"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FileText,
  Video,
  Image,
  MessageSquare,
  Edit,
  Settings,
  ChevronLeft,
  ChevronRight,
  Mail,
  ClipboardList,
  Users,
  History, // <-- Add icon for Audit Logs
} from "lucide-react"
import { useRole } from "../contexts/role-context"
import { useState, useEffect } from "react"
import { useSwipeable } from "@/hooks/use-swipeable"

interface AdminSidebarProps {
  activeSection: string
  setActiveSection: (section: string) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export function AdminSidebar({
  setActiveSection,
  sidebarOpen,
  setSidebarOpen,
}: AdminSidebarProps) {
  const { accessibleSections } = useRole()
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()

  const menuItems = [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard, count: null, href: "/admin/dashboard" },
    { id: "blogs", label: "Blog Posts", icon: FileText, count: null, href: "/admin/dashboard/blog-posts" },
    { id: "videos", label: "Videos", icon: Video, count: null, href: "/admin/dashboard/videos" },
    { id: "media", label: "Media", icon: Image, count: null, href: "/admin/dashboard/media" },
    { id: "categories", label: "Categories", icon: Edit, count: null, href: "/admin/dashboard/categories" },
    { id: "comments", label: "Comments", icon: MessageSquare, count: null, href: "/admin/dashboard/comments" },
    { id: "applications", label: "Applications", icon: ClipboardList, count: null, href: "/admin/dashboard/applications" },
    { id: "inbox", label: "Email Inbox", icon: Mail, count: null, href: "/admin/dashboard/inbox" },
    { id: "users", label: "Users", icon: Users, count: null, href: "/admin/dashboard/users" },
    // --- Audit Logs (visible only to admins/system) ---
    { id: "audit-logs", label: "Audit Logs", icon: History, count: null, href: "/admin/dashboard/audit-logs" },
    { id: "settings", label: "Settings", icon: Settings, count: null, href: "/admin/dashboard/settings" },
  ]

  const filteredNavItems = menuItems.filter(
    (item) => accessibleSections.includes(item.id) || item.id === "overview"
  )

  // Always highlight based on current path, not state
  const getActiveId = () => {
    const match = filteredNavItems
      .filter(
        (item) =>
          item.href &&
          (pathname === item.href || pathname.startsWith(`${item.href}/`))
      )
      .sort((a, b) => (b.href!.length - a.href!.length))[0]
    return match?.id
  }
  const activeId = getActiveId()

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // --- SWIPE GESTURES ---
  const swipeHandlers = useSwipeable({
    onSwipeLeft: () => setSidebarOpen(false),
    onSwipeRight: () => setSidebarOpen(true),
    enabled: isMobile,
  })

  // --- SIDEBAR CONTENT ---
  const renderContent = () => (
    <>
      {/* Sidebar Header */}
      <div className={`${sidebarOpen ? "p-4" : "p-2"} border-b border-gray-200 dark:border-gray-800 min-h-[80px] flex items-center`}>
        <div className="flex items-center justify-between w-full">
          {sidebarOpen ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">FS</span>
              </div>
              <div className="min-w-0">
                <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm block truncate">Admin Panel</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 block truncate">Flavor Studios</span>
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
            aria-expanded={sidebarOpen}
            aria-controls="admin-sidebar"
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
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">Administrator</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Manage your studio</p>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="flex-1 p-2 overflow-y-visible md:overflow-y-visible">
        <div className="space-y-1 flex flex-col">
          {filteredNavItems.map((item) => {
            const active = item.id === activeId
            const Icon = item.icon

            return (
              <Button
                key={item.id}
                asChild={!!item.href}
                variant={active ? "default" : "ghost"}
                className={`w-full ${
                  sidebarOpen ? "justify-start px-3" : "justify-center px-0"
                } h-10 ${
                  active
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
                title={!sidebarOpen ? item.label : undefined}
                onClick={
                  item.href
                    ? (isMobile ? () => setSidebarOpen(false) : undefined)
                    : () => {
                        setActiveSection(item.id)
                        if (isMobile) setSidebarOpen(false)
                      }
                }
              >
                {item.href ? (
                  <Link href={item.href} className="flex items-center w-full">
                    <Icon className={`h-5 w-5 flex-shrink-0 ${sidebarOpen ? "mr-3" : ""}`} />
                    {sidebarOpen && (
                      <>
                        <span className="flex-1 text-left text-sm truncate">{item.label}</span>
                        {item.count && (
                          <Badge
                            variant="secondary"
                            className={`ml-2 text-xs ${
                              active
                                ? "bg-white/20 text-white"
                                : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                            }`}
                          >
                            {item.count}
                          </Badge>
                        )}
                      </>
                    )}
                  </Link>
                ) : (
                  <>
                    <Icon className={`h-5 w-5 flex-shrink-0 ${sidebarOpen ? "mr-3" : ""}`} />
                    {sidebarOpen && (
                      <>
                        <span className="flex-1 text-left text-sm truncate">{item.label}</span>
                        {item.count && (
                          <Badge
                            variant="secondary"
                            className="ml-2 text-xs bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                          >
                            {item.count}
                          </Badge>
                        )}
                      </>
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
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 mt-auto">
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            <p className="font-medium">Flavor Studios Admin</p>
            <p>Version 1.0.0</p>
          </div>
        </div>
      )}
    </>
  )

  // --- SIDEBAR RENDER ---
  return (
    <>
      {isMobile ? (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent
            side="left"
            className="p-0 w-64"
            id="admin-sidebar"
            {...swipeHandlers}
          >
            {renderContent()}
          </SheetContent>
        </Sheet>
      ) : (
        <aside
          id="admin-sidebar"
          className={`bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 sticky top-0 h-screen ${
            sidebarOpen ? "w-64" : "w-20"
          } flex flex-col`}
          style={{ height: "100vh", overflowY: "hidden" }}
          {...swipeHandlers}
        >
          {renderContent()}
        </aside>
      )}
    </>
  )
}
