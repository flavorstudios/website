// app/admin/dashboard/components/admin-sidebar.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
} from "lucide-react"
import { useRole } from "../contexts/role-context"
import type React from "react"
import { useEffect, useMemo, Dispatch, SetStateAction } from "react"
import useMediaQuery from "@/hooks/use-media-query"
import { ADMIN_HEADER_HEIGHT } from "@/lib/constants"
import { SectionId } from "../sections"

interface AdminSidebarProps {
  /** Optional id so aria-controls can point to the landmark directly */
  id?: string
  activeSection: SectionId
  setActiveSection: Dispatch<SetStateAction<SectionId>>
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

type MenuItem = {
  id: SectionId
  label: string
  ariaLabel?: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  count: number | null
  href?: string
}

export function AdminSidebar({
  id = "app-sidebar",
  activeSection, // kept as a fallback when deriving active link
  setActiveSection,
  sidebarOpen,
  setSidebarOpen,
}: AdminSidebarProps) {
  const { accessibleSections } = useRole()
  const isMobile = useMediaQuery("(max-width: 767px)")
  const pathname = usePathname()

  const menuItems: MenuItem[] = [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard, count: null, href: "/admin/dashboard" },
    { id: "blogs", label: "Blog Posts", icon: FileText, count: null, href: "/admin/dashboard/blog-posts" },
    { id: "videos", label: "Videos", icon: Video, count: null, href: "/admin/dashboard/videos" },
    { id: "media", label: "Media", icon: Image, count: null, href: "/admin/dashboard/media" },
    { id: "categories", label: "Categories", icon: Edit, count: null, href: "/admin/dashboard/categories" },
    { id: "comments", label: "Comments", icon: MessageSquare, count: null, href: "/admin/dashboard/comments" },
    { id: "applications", label: "Applications", icon: ClipboardList, count: null, href: "/admin/dashboard/applications" },
    { id: "inbox", label: "Email Inbox", icon: Mail, count: null, href: "/admin/dashboard/inbox" },
    {
      id: "users",
      label: "User Management",
      ariaLabel: "Users",
      icon: Users,
      count: null,
      href: "/admin/dashboard/users",
    },
    { id: "settings", label: "Settings", icon: Settings, count: null, href: "/admin/dashboard/settings" },
  ]

  const filteredNavItems = menuItems.filter(
    (item) => accessibleSections.includes(item.id) || item.id === "overview"
  )

  // Always highlight based on current path; fall back to activeSection when no match
  const activeId = useMemo(() => {
    const match = filteredNavItems
      .filter(
        (item) =>
          item.href &&
          (pathname === item.href || pathname.startsWith(`${item.href}/`))
      )
      .sort((a, b) => (b.href!.length - a.href!.length))[0]
    return match?.id || activeSection
  }, [pathname, filteredNavItems, activeSection])

  // Auto-close the sidebar on route change for small screens
  useEffect(() => {
    if (isMobile) setSidebarOpen(false)
  }, [pathname, isMobile, setSidebarOpen])

  return (
    <>
      <aside
        id={id}
        role="complementary"
        aria-hidden={isMobile && !sidebarOpen}
        className={`
          h-full md:h-screen overflow-y-auto bg-background border-r
          ${isMobile
            ? "fixed left-0 top-0 z-40 transition-transform duration-300 ease-in-out"
            : "sticky top-0 z-40"}
          ${sidebarOpen
            ? "translate-x-0 pointer-events-auto"
            : "-translate-x-full md:translate-x-0 pointer-events-none md:pointer-events-auto"}
          w-64 ${sidebarOpen ? "md:w-64" : "md:w-20"}
          flex flex-col md:relative
        `}
        aria-label="Admin navigation"
      >
        {/* Sidebar Header: match main nav height, remove extra vertical padding */}
        <div className={`${sidebarOpen ? "px-4" : "px-2"} border-b border-border ${ADMIN_HEADER_HEIGHT} flex items-center`}>
          <div className="flex items-center justify-between w-full">
            {sidebarOpen ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">FS</span>
                </div>
                <div className="min-w-0">
                    <span className="font-semibold text-foreground text-sm block truncate">Admin Panel</span>
                  <span className="text-xs text-muted-foreground block truncate">Flavor Studios</span>
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
              className="hidden md:flex p-1 h-8 w-8 focus:outline-none focus:ring"
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              aria-expanded={sidebarOpen}
              aria-controls={id}
              type="button"
            >
              {sidebarOpen ? (
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              ) : (
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>

        {/* User Info */}
        {sidebarOpen && (
          <div className="px-4 py-3 border-b border-border">
            <p className="font-medium text-foreground text-sm">Administrator</p>
            <p className="text-xs text-muted-foreground">Manage your studio</p>
          </div>
        )}

        {/* Navigation Menu */}
        <nav
          className="flex-1 p-2 overflow-y-visible md:overflow-y-visible"
          aria-label="Primary"
        >
          <div className="space-y-1 max-h-[calc(100vh-230px)] overflow-y-auto">
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
                      : "text-muted-foreground hover:bg-muted"
                  } focus:outline-none focus:ring`}
                  // Only handle clicks here for non-href items
                  onClick={
                    item.href
                      ? undefined
                      : () => {
                          setActiveSection(item.id)
                          if (isMobile) setSidebarOpen(false)
                        }
                  }
                  // Avoid passing type to <a> when asChild is true
                  type={item.href ? undefined : "button"}
                >
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="flex items-center w-full"
                      aria-label={item.ariaLabel ?? item.label}
                      aria-current={active ? "page" : undefined}
                      title={!sidebarOpen ? item.label : undefined}
                      onClick={() => {
                        // Immediate state update so highlight reflects the click even before route change
                        setActiveSection(item.id)
                        if (isMobile) setSidebarOpen(false)
                      }}
                    >
                      <Icon className={`h-5 w-5 flex-shrink-0 ${sidebarOpen ? "mr-3" : ""}`} aria-hidden="true" />
                      {sidebarOpen && (
                        <>
                          <span className="flex-1 text-left text-sm truncate">{item.label}</span>
                          {item.count && (
                            <Badge
                                variant="secondary"
                              className={`ml-2 text-xs ${
                                active ? "bg-white/20 text-white" : "bg-muted text-foreground"
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
                      <Icon className={`h-5 w-5 flex-shrink-0 ${sidebarOpen ? "mr-3" : ""}`} aria-hidden="true" />
                      {sidebarOpen && (
                        <>
                          <span className="flex-1 text-left text-sm truncate">{item.label}</span>
                          {item.count && (
                            <Badge
                                variant="secondary"
                              className="ml-2 text-xs bg-muted text-foreground"
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
          <div className="p-4 border-t border-border mt-auto">
            <div className="text-xs text-muted-foreground text-center">
              <p className="font-medium">Flavor Studios Admin</p>
              <p>Version 1.0.0</p>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
