"use client"

import { useState, useEffect, useCallback } from "react"
import { usePathname } from "next/navigation"
import AdminAuthGuard from "@/components/AdminAuthGuard"
import { AdminSidebar } from "./components/admin-sidebar"
import { DashboardOverview } from "./components/dashboard-overview"
import { BlogManager } from "./components/blog-manager"
import { VideoManager } from "./components/video-manager"
import { CommentManager } from "./components/comment-manager"
import { SystemTools } from "./components/system-tools"
import { UserRoleManager } from "./components/user-role-manager"
import { AdminHeader } from "./components/admin-header"
import CategoryManager from "@/components/admin/category/CategoryManager"
import { RoleProvider } from "./contexts/role-context"
import { EmailInbox } from "./components/email-inbox"
import { getAuth, signOut } from "firebase/auth"
import app, { firebaseInitError } from "@/lib/firebase"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AdminDashboardPageClientProps {
  initialSection?: string
}

export default function AdminDashboardPageClient({
  initialSection = "overview",
}: AdminDashboardPageClientProps) {
  const [activeSection, setActiveSection] = useState(initialSection)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState("")
  const pathname = usePathname() // Current Next.js App Router path

  // --- On mount, mark as ready ---
  useEffect(() => {
    setMounted(true)
    fetch("/api/admin/init", { method: "POST" }).catch((err) => {
      if (process.env.NODE_ENV !== "production") console.error("Admin init failed:", err)
    })
  }, [])

  // --- Listen for section navigation events (optional) ---
  useEffect(() => {
    const handleNavigation = (event: Event) => {
      const customEvent = event as CustomEvent<string>
      setActiveSection(customEvent.detail)
    }
    window.addEventListener("admin-navigate", handleNavigation)
    return () => window.removeEventListener("admin-navigate", handleNavigation)
  }, [])

  // --- Keep activeSection in sync with the current route ---
  useEffect(() => {
    // Map sidebar routes to their section IDs
    const map = [
      { id: "overview", href: "/admin/dashboard" },
      { id: "blogs", href: "/admin/dashboard/blog-posts" },
      { id: "videos", href: "/admin/dashboard/videos" },
      { id: "categories", href: "/admin/dashboard/categories" },
      { id: "comments", href: "/admin/dashboard/comments" },
      { id: "inbox", href: "/admin/dashboard/inbox" },
      { id: "users", href: "/admin/dashboard/users" },
      { id: "settings", href: "/admin/dashboard/settings" },
      { id: "system", href: "/admin/dashboard/system" },
    ]
    const matched = map
      .filter((m) => pathname === m.href || pathname.startsWith(`${m.href}/`))
      .sort((a, b) => b.href.length - a.href.length)[0]
    if (matched && matched.id !== activeSection) {
      setActiveSection(matched.id)
    }
  }, [pathname])

  // --- Refresh data periodically ---
  useEffect(() => {
    const interval = setInterval(() => {
      window.dispatchEvent(new CustomEvent("admin-refresh"))
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  // --- Sidebar responsive toggle ---
  useEffect(() => {
    if (typeof window === "undefined") return
    const handleResize = () => {
      if (window.innerWidth < 1024) setSidebarOpen(false)
      else setSidebarOpen(true)
    }
    window.addEventListener("resize", handleResize)
    handleResize()
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // --- Logout logic (Firebase + server) ---
  const handleLogout = useCallback(async () => {
    try {
      if (firebaseInitError || !app) {
        setError(
          firebaseInitError?.message ||
          "Firebase not initialized. Cannot log out safely."
        )
        return
      }
      const auth = getAuth(app)
      await signOut(auth)
      await fetch("/api/admin/logout", { method: "POST" })
      window.location.href = "/admin/login"
    } catch (error) {
      setError("Logout failed. Please try again.")
      if (process.env.NODE_ENV !== "production") {
        console.error("Logout failed:", error)
      }
    }
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="text-lg font-medium text-gray-700">Loading Admin Dashboard...</span>
        </div>
      </div>
    )
  }

  // Renders the main section content based on activeSection
  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return <DashboardOverview />
      case "blogs":
        return <BlogManager />
      case "videos":
        return <VideoManager />
      case "categories":
        return <CategoryManager />
      case "comments":
        return <CommentManager />
      case "inbox":
        return <EmailInbox />
      case "system":
        return <SystemTools />
      case "users":
        return <UserRoleManager />
      default:
        return <DashboardOverview />
    }
  }

  return (
    <AdminAuthGuard>
      <RoleProvider>
        <div className="min-h-screen bg-gray-50 flex overflow-x-hidden">
          <AdminSidebar
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />

          <div className="flex-1 flex flex-col">
            <AdminHeader onLogout={handleLogout} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            <main className="flex-1 p-6 overflow-auto">
              <div className="max-w-7xl mx-auto">
                {error && (
                  <Alert variant="destructive" className="mb-4 border-red-200 bg-red-50">
                    <AlertDescription className="text-red-700 text-sm">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}
                {renderContent()}
              </div>
            </main>
          </div>
        </div>
      </RoleProvider>
    </AdminAuthGuard>
  )
}
