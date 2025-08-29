"use client"

import { LayoutDashboard, FileText, Image, Settings } from "lucide-react"
import { useRouter } from "next/navigation"
import type React from "react"
import { useEffect, useRef } from "react"
import type { Dispatch, SetStateAction } from "react"
import type { SectionId } from "../sections"

interface MobileNavProps {
  activeSection: SectionId
  setActiveSection: Dispatch<SetStateAction<SectionId>>
}

export default function MobileNav({ activeSection, setActiveSection }: MobileNavProps) {
  const router = useRouter()
  const navRef = useRef<HTMLElement>(null)

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

  const items: { id: SectionId; label: string; icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; href: string }[] = [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
    { id: "blogs", label: "Posts", icon: FileText, href: "/admin/dashboard/blog-posts" },
    { id: "media", label: "Media", icon: Image, href: "/admin/dashboard/media" },
    { id: "settings", label: "Settings", icon: Settings, href: "/admin/dashboard/settings" },
  ]

  return (
    <nav
      ref={navRef}
      aria-label="Mobile primary"
      className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-2 pb-[calc(env(safe-area-inset-bottom,0px)+0.5rem)] z-50 md:hidden"
    >
      <ul className="flex justify-around">
        {items.map((item) => {
          const Icon = item.icon
          const active = activeSection === item.id
          return (
            <li key={item.id}>
              <button
                className={`flex flex-col items-center text-xs focus:outline-none ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
                onClick={() => {
                  setActiveSection(item.id)
                  if (item.href) router.push(item.href)
                }}
                aria-label={item.label}
              >
                <Icon className="h-5 w-5" />
                <span className="mt-1">{item.label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
