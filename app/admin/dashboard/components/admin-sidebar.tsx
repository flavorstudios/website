"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  LayoutDashboard,
  FileText,
  Video,
  MessageSquare,
  Edit,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

interface AdminSidebarProps {
  activeSection: string
  setActiveSection: (section: string) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export function AdminSidebar({ activeSection, setActiveSection, sidebarOpen, setSidebarOpen }: AdminSidebarProps) {
  const menuItems = [
    {
      id: "overview",
      label: "Dashboard",
      icon: LayoutDashboard,
      count: null,
    },
    {
      id: "blogs",
      label: "Blog Posts",
      icon: FileText,
      count: 24,
    },
    {
      id: "videos",
      label: "Videos",
      icon: Video,
      count: 8,
    },
    {
      id: "categories",
      label: "Categories",
      icon: Edit,
      count: null,
    },
    {
      id: "comments",
      label: "Comments",
      icon: MessageSquare,
      count: 3,
    },
    {
      id: "pages",
      label: "Page Editor",
      icon: Edit,
      count: null,
    },
    {
      id: "system",
      label: "Settings",
      icon: Settings,
      count: null,
    },
  ]

  return (
    <aside
      className={`bg-white border-r border-gray-200 transition-all duration-300 ${
        sidebarOpen ? "w-64" : "w-16"
      } flex flex-col`}
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">FS</span>
              </div>
              <span className="font-semibold text-gray-900">Admin Panel</span>
            </div>
          )}
          <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden lg:flex">
            {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const isActive = activeSection === item.id
            const Icon = item.icon

            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start ${
                  isActive
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                } ${!sidebarOpen ? "px-2" : ""}`}
                onClick={() => setActiveSection(item.id)}
              >
                <Icon className={`h-5 w-5 ${sidebarOpen ? "mr-3" : ""}`} />
                {sidebarOpen && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.count && (
                      <Badge
                        variant="secondary"
                        className={`ml-2 ${isActive ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"}`}
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
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            <p>Flavor Studios Admin</p>
            <p>Version 1.0.0</p>
          </div>
        </div>
      )}
    </aside>
  )
}
