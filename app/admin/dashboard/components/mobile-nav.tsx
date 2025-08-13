"use client"

import { LayoutDashboard, FileText, Image, Settings } from "lucide-react"
import { useRouter } from "next/navigation"

interface MobileNavProps {
  activeSection: string
  setActiveSection: (section: string) => void
}

export default function MobileNav({ activeSection, setActiveSection }: MobileNavProps) {
  const router = useRouter()

  const items = [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
    { id: "blogs", label: "Posts", icon: FileText, href: "/admin/dashboard/blog-posts" },
    { id: "media", label: "Media", icon: Image, href: "/admin/dashboard/media" },
    { id: "settings", label: "Settings", icon: Settings, href: "/admin/dashboard/settings" },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-2 z-50 md:hidden">
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
