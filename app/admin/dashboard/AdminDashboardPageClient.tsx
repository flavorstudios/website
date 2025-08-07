"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { usePathname } from "next/navigation"
import dynamic from "next/dynamic"
import AdminAuthGuard from "@/components/AdminAuthGuard"
import { AdminSidebar } from "./components/admin-sidebar"
import { AdminHeader } from "./components/admin-header"
import { RoleProvider } from "./contexts/role-context"
import { getAuth, signOut } from "firebase/auth"
import app, { firebaseInitError } from "@/lib/firebase"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"

// --- Dynamically imported dashboard sections for code splitting ---
const DashboardOverview = dynamic(() =>
  import("./components/dashboard-overview").then(m => m.DashboardOverview),
  { suspense: true }
)
const BlogManager = dynamic(() =>
  import("./components/blog-manager").then(m => m.BlogManager),
  { suspense: true }
)
const VideoManager = dynamic(() =>
  import("./components/video-manager").then(m => m.VideoManager),
  { suspense: true }
)
const CommentManager = dynamic(() =>
  import("./components/comment-manager").then(m => m.CommentManager),
  { suspense: true }
)
const SystemTools = dynamic(() =>
  import("./components/system-tools").then(m => m.SystemTools),
  { suspense: true }
)
const UserManagement = dynamic(() =>
  import("./components/user-management/UserManagement"),
  { suspense: true }
)
const CategoryManager = dynamic(() =>
  import("@/components/admin/category/CategoryManager"),
  { suspense: true }
)
const EmailInbox = dynamic(() =>
  import("./components/email-inbox").then(m => m.EmailInbox),
  { suspense: true }
)
const MediaLibrary = dynamic(() =>
  import("./components/media/MediaLibrary"),
  { suspense: true }
)
const CareerApplications = dynamic(() =>
  import("./components/career-applications"),
  { suspense: true }
)

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
  const pathname = usePathname()

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
    const map = [
      { id: "overview", href: "/admin/dashboard" },
      { id: "blogs", href: "/admin/dashboard/blog-posts" },
      { id: "videos", href: "/admin/dashboard/videos" },
      { id: "media", href: "/admin/dashboard/media" },
      { id: "categories", href: "/admin/dashboard/categories" },
      { id: "comments", href: "/admin/dashboard/comments" },
      { id: "applications", href: "/admin/dashboard/applications" },
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
  }, [pathname, activeSection])

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
        <Spinner />
        <span className="text-lg font-medium text-gray-700 ml-3">Loading Admin Dashboard...</span>
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
      case "media":
        return <MediaLibrary />
      case "categories":
        return <CategoryManager />
      case "comments":
        return <CommentManager />
      case "applications":
        return <CareerApplications />
      case "inbox":
        return <EmailInbox />
      case "system":
        return <SystemTools />
      case "users":
        return <UserManagement />
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
                <Suspense fallback={<Spinner />}>
                  {renderContent()}
                </Suspense>
              </div>
            </main>
          </div>
        </div>
      </RoleProvider>
    </AdminAuthGuard>
  )
}
