"use client"

import {
  LayoutDashboard,
  FileText,
  Image,
  Settings,
  Video,
  MessageSquare,
  Edit,
  Server,
  Mail,
  ClipboardList,
  Users,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type React from "react"
import { useEffect, useRef } from "react"
import type { Dispatch, SetStateAction } from "react"
import type { SectionId } from "../sections"
import { useRole } from "../contexts/role-context"

interface MobileNavProps {
  activeSection: SectionId
  setActiveSection: Dispatch<SetStateAction<SectionId>>
  onNavigateSection?: (section: SectionId, href: string) => void
}

export default function MobileNav({
  activeSection,
  setActiveSection,
  onNavigateSection,
}: MobileNavProps) {
  const pathname = usePathname()
  const navRef = useRef<HTMLElement>(null)
  const { accessibleSections } = useRole()

  // Sync CSS variable so main content can pad for the exact nav height
  useEffect(() => {
    const root = document.documentElement
    const updateHeight = () => {
      if (navRef.current) {
        root.style.setProperty("--mobile-nav-h", `${navRef.current.offsetHeight}px`)
      }
    }
    updateHeight()
    window.addEventListener("resize", updateHeight)
    return () => {
      window.removeEventListener("resize", updateHeight)
      root.style.removeProperty("--mobile-nav-h")
    }
  }, [])

  const items: {
    id: SectionId
    label: string
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
    href: string
  }[] = [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
    { id: "blogs", label: "Blog Posts", icon: FileText, href: "/admin/dashboard/blog-posts" },
    { id: "videos", label: "Videos", icon: Video, href: "/admin/dashboard/videos" },
    { id: "media", label: "Media", icon: Image, href: "/admin/dashboard/media" },
    { id: "categories", label: "Categories", icon: Edit, href: "/admin/dashboard/categories" },
    { id: "comments", label: "Comments", icon: MessageSquare, href: "/admin/dashboard/comments" },
    { id: "applications", label: "Applications", icon: ClipboardList, href: "/admin/dashboard/applications" },
    { id: "inbox", label: "Email Inbox", icon: Mail, href: "/admin/dashboard/inbox" },
    { id: "users", label: "Users", icon: Users, href: "/admin/dashboard/users" },
    { id: "system", label: "System Tools", icon: Server, href: "/admin/dashboard/system" },
    { id: "settings", label: "Settings", icon: Settings, href: "/admin/dashboard/settings" },
  ]

  const filteredItems = items.filter((item) => accessibleSections.includes(item.id) || item.id === "overview")
  const navItems = filteredItems.length > 0 ? filteredItems : items.filter((item) => item.id === "overview")

  return (
    <nav
      ref={navRef}
      aria-label="Mobile primary"
      className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-2 pb-[calc(env(safe-area-inset-bottom,0px)+0.5rem)] z-50 md:hidden"
    >
      <ul
        className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1"
        role="list"
      >
        {navItems.map((item) => {
          const Icon = item.icon
          const active = activeSection === item.id
          const isCurrent = pathname === item.href
          return (
            <li key={item.id} className="flex-shrink-0 snap-start">
              <Link
                href={item.href}
                className={`flex min-h-[44px] min-w-[64px] flex-col items-center justify-center gap-1 rounded-md px-3 py-2 text-[11px] font-medium leading-4 text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
                onClick={(event) => {
                  if (onNavigateSection) {
                    event.preventDefault()
                    onNavigateSection(item.id, item.href)
                  }
                  setActiveSection(item.id)
                }}
                aria-label={item.label}
                aria-current={isCurrent ? "page" : undefined}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span className="whitespace-nowrap">{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
