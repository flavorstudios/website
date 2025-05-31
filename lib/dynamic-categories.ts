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
  Mail,
  Users,
} from "lucide-react"
import { useRole } from "../contexts/role-context"
import { useState, useEffect } from "react"
import { getCategoriesWithFallback, type CategoryData } from "@/lib/dynamic-categories"

interface AdminSidebarProps {
  activeSection: string
  setActiveSection: (section: string) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export function AdminSidebar({ activeSection, setActiveSection, sidebarOpen, setSidebarOpen }: AdminSidebarProps) {
  const { accessibleSections, userRole } = useRole()
  const [isMobile, setIsMobile] = useState(false)

  // NEW: State for blog & video categories
  const [blogCategories, setBlogCategories] = useState<CategoryData[]>([])
  const [videoCategories, setVideoCategories] = useState<CategoryData[]>([])

  // Fetch blog & video categories on mount
  useEffect(() => {
    async function fetchCategories() {
      const { blogCategories, videoCategories } = await getCategoriesWithFallback()
      setBlogCategories(blogCategories)
      setVideoCategories(videoCategories)
    }
    fetchCategories()
  }, [])

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
      count: null,
    },
    {
      id: "videos",
      label: "Videos",
      icon: Video,
      count: null,
    },
    {
      id: "comments",
      label: "Comments",
      icon: MessageSquare,
      count: null,
    },
    {
      id: "inbox",
      label: "Email Inbox",
      icon: Mail,
      count: null,
    },
    {
      id: "users",
      label: "Users",
      icon: Users,
      count: null,
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      count: null,
    },
  ]

  // Filter navigation items based on user role
  const filteredNavItems = menuItems.filter((item) => accessibleSections.includes(item.id) || item.id === "overview")

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setSidebarOpen(false)
      }
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [setSidebarOpen])

  return (
    <aside
      className={`bg-white border-r border-gray-200 transition-all duration-300 ease-in-out ${
        sidebarOpen ? "w-64" : "w-16"
      } flex flex-col h-full fixed left-0 top-0 z-40 md:relative md:z-auto`}
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200 min-h-[80px] flex items-center">
        <div className="flex items-center justify-between w-full">
          {sidebarOpen && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">FS</span>
              </div>
              <div className="min-w-0">
                <span className="font-semibold text-gray-900 text-sm block truncate">Admin Panel</span>
                <span className="text-xs text-gray-500 block truncate">Flavor Studios</span>
              </div>
            </div>
          )}
          {!sidebarOpen && (
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center mx-auto">
              <span className="text-white font-bold text-xs">FS</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden md:flex p-1 h-8 w-8"
          >
            {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* User Info */}
      {sidebarOpen && (
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-gray-600 font-medium text-sm">OM</span>
            </div>
            <div className="min-w-0">
              <p className="font-medium text-gray-900 text-sm truncate">Administrator</p>
              <p className="text-xs text-gray-500 truncate">Manage your store</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="flex-1 p-2 overflow-y-auto">
        <div className="space-y-1">
          {filteredNavItems.map((item) => {
            const isActive = activeSection === item.id
            const Icon = item.icon

            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={`w-full ${sidebarOpen ? "justify-start px-3" : "justify-center px-0"} h-10 ${
                  isActive
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => setActiveSection(item.id)}
                title={!sidebarOpen ? item.label : undefined}
              >
                <Icon className={`h-5 w-5 flex-shrink-0 ${sidebarOpen ? "mr-3" : ""}`} />
                {sidebarOpen && (
                  <>
                    <span className="flex-1 text-left text-sm truncate">{item.label}</span>
                    {item.count && (
                      <Badge
                        variant="secondary"
                        className={`ml-2 text-xs ${isActive ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"}`}
                      >
                        {item.count}
                      </Badge>
                    )}
                  </>
                )}
              </Button>
            )
          })}

          {/* Blog Categories Section */}
          {blogCategories.length > 0 && (
            <div className="pt-2 pb-1">
              <div className={`px-3 py-1 text-xs font-semibold text-gray-400 ${sidebarOpen ? "" : "sr-only"}`}>
                Blog Categories
              </div>
              <div className="space-y-1">
                {blogCategories.map((cat) => (
                  <Button
                    key={`blog-${cat.slug}`}
                    variant={activeSection === `blog-category-${cat.slug}` ? "default" : "ghost"}
                    className={`w-full ${sidebarOpen ? "justify-start px-3" : "justify-center px-0"} h-10
                      ${activeSection === `blog-category-${cat.slug}` ?
                        "bg-gradient-to-r from-purple-600 to-blue-600 text-white" :
                        "text-gray-700 hover:bg-gray-100"}`}
                    onClick={() => setActiveSection(`blog-category-${cat.slug}`)}
                    title={!sidebarOpen ? cat.name : undefined}
                  >
                    <Edit className={`h-5 w-5 flex-shrink-0 ${sidebarOpen ? "mr-3" : ""}`} />
                    {sidebarOpen && (
                      <>
                        <span className="flex-1 text-left text-sm truncate">{cat.name}</span>
                        {cat.count > 0 && (
                          <Badge
                            variant="secondary"
                            className={`ml-2 text-xs ${activeSection === `blog-category-${cat.slug}` ?
                              "bg-white/20 text-white" : "bg-gray-200 text-gray-700"}`}
                          >
                            {cat.count}
                          </Badge>
                        )}
                      </>
                    )}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Video Categories Section */}
          {videoCategories.length > 0 && (
            <div className="pt-2 pb-1">
              <div className={`px-3 py-1 text-xs font-semibold text-gray-400 ${sidebarOpen ? "" : "sr-only"}`}>
                Video Categories
              </div>
              <div className="space-y-1">
                {videoCategories.map((cat) => (
                  <Button
                    key={`video-${cat.slug}`}
                    variant={activeSection === `video-category-${cat.slug}` ? "default" : "ghost"}
                    className={`w-full ${sidebarOpen ? "justify-start px-3" : "justify-center px-0"} h-10
                      ${activeSection === `video-category-${cat.slug}` ?
                        "bg-gradient-to-r from-purple-600 to-blue-600 text-white" :
                        "text-gray-700 hover:bg-gray-100"}`}
                    onClick={() => setActiveSection(`video-category-${cat.slug}`)}
                    title={!sidebarOpen ? cat.name : undefined}
                  >
                    <Edit className={`h-5 w-5 flex-shrink-0 ${sidebarOpen ? "mr-3" : ""}`} />
                    {sidebarOpen && (
                      <>
                        <span className="flex-1 text-left text-sm truncate">{cat.name}</span>
                        {cat.count > 0 && (
                          <Badge
                            variant="secondary"
                            className={`ml-2 text-xs ${activeSection === `video-category-${cat.slug}` ?
                              "bg-white/20 text-white" : "bg-gray-200 text-gray-700"}`}
                          >
                            {cat.count}
                          </Badge>
                        )}
                      </>
                    )}
                  </Button>
                ))}
              </div>
            </div>
          )}
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

      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </aside>
  )
}
