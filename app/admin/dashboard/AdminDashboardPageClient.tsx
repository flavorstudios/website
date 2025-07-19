"use client"

import { useState, useEffect, useCallback } from "react"
import AdminAuthGuard from "@/components/AdminAuthGuard"
import { AdminSidebar } from "./components/admin-sidebar"
import { DashboardOverview } from "./components/dashboard-overview"
import { BlogManager } from "./components/blog-manager"
import { VideoManager } from "./components/video-manager"
import { CommentManager } from "./components/comment-manager"
import { PageCustomizer } from "./components/page-customizer"
import { SystemTools } from "./components/system-tools"
import { AdminHeader } from "./components/admin-header"
import { CategoryManager } from "./components/category-manager"
import { RoleProvider } from "./contexts/role-context"
import { EmailInbox } from "./components/email-inbox"
import { getAuth, signOut } from "firebase/auth"
import app, { firebaseInitError } from "@/lib/firebase"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AdminDashboardPageClient() {
  const [activeSection, setActiveSection] = useState("overview")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState("")

  // --- Initialization on first load ---
  useEffect(() => {
    setMounted(true)
    fetch("/api/admin/init", { method: "POST" }).catch((err) => {
      if (process.env.NODE_ENV !== "production") console.error("Admin init failed:", err)
    })
  }, [])

  // --- Section navigation event ---
  useEffect(() => {
    const handleNavigation = (event: Event) => {
      const customEvent = event as CustomEvent<string>
      setActiveSection(customEvent.detail)
    }
    window.addEventListener("admin-navigate", handleNavigation)
    return () => window.removeEventListener("admin-navigate", handleNavigation)
  }, [])

  // --- Data refresh interval ---
  useEffect(() => {
    const interval = setInterval(() => {
      window.dispatchEvent(new CustomEvent("admin-refresh"))
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  // --- Responsive sidebar (hide on small screens) ---
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

  // --- Logout: Clear Firebase + server session cookie ---
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
      case "pages":
        return <PageCustomizer />
      case "system":
        return <SystemTools />
      default:
        return <DashboardOverview />
    }
  }

  return (
    <AdminAuthGuard>
      <RoleProvider>
        <div className="min-h-screen bg-gray-50 flex">
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
