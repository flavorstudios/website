"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { usePathname, useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import AdminAuthGuard from "@/components/AdminAuthGuard"
import { AdminSidebar } from "./components/admin-sidebar"
import { AdminHeader } from "./components/admin-header"
import HelpModal from "@/components/admin/HelpModal"
import { RoleProvider } from "./contexts/role-context"
import { getAuth, signOut } from "firebase/auth"
import app, { firebaseInitError } from "@/lib/firebase"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import ErrorBoundary from "@/components/admin/ErrorBoundary"

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
const AuditLogViewer = dynamic(() =>
  import("./components/audit-log-viewer").then(m => m.AuditLogViewer),
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
  const [helpOpen, setHelpOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0) // ⬅️ added
  const pathname = usePathname()
  const router = useRouter()

  const defaultKeyMap = {
    overview: "d",
    blogs: "b",
    videos: "v",
    media: "m",
    categories: "c",
    comments: "o",
    applications: "a",
    inbox: "i",
    users: "u",
    auditLogs: "l",
    settings: "s",
    system: "y",
  }
  const [shortcuts, setShortcuts] = useState(defaultKeyMap)

  // Load custom shortcuts
  useEffect(() => {
    const stored = localStorage.getItem("adminKeyMap")
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setShortcuts({ ...defaultKeyMap, ...parsed })
      } catch {
        setShortcuts(defaultKeyMap)
      }
    }
  }, [])

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
      { id: "audit-logs", href: "/admin/dashboard/audit-logs" },
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

  // --- Listen for global admin-refresh and remount active section ---
  useEffect(() => {
    const handleRefresh = () => setRefreshKey((k) => k + 1)
    window.addEventListener("admin-refresh", handleRefresh)
    return () => window.removeEventListener("admin-refresh", handleRefresh)
  }, [])

  // --- Keyboard shortcuts ---
  useEffect(() => {
    let awaitingG = false
    const keyToPath: Record<string, string> = {
      [shortcuts.overview]: "/admin/dashboard",
      [shortcuts.blogs]: "/admin/dashboard/blog-posts",
      [shortcuts.videos]: "/admin/dashboard/videos",
      [shortcuts.media]: "/admin/dashboard/media",
      [shortcuts.categories]: "/admin/dashboard/categories",
      [shortcuts.comments]: "/admin/dashboard/comments",
      [shortcuts.applications]: "/admin/dashboard/applications",
      [shortcuts.inbox]: "/admin/dashboard/inbox",
      [shortcuts.users]: "/admin/dashboard/users",
      [shortcuts.auditLogs]: "/admin/dashboard/audit-logs",
      [shortcuts.settings]: "/admin/dashboard/settings",
      [shortcuts.system]: "/admin/dashboard/system",
    }
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      )
        return

      if (e.key === "?" && !awaitingG) {
        e.preventDefault()
        setHelpOpen(true)
        return
      }

      if (!awaitingG) {
        if (e.key.toLowerCase() === "g") {
          awaitingG = true
          setTimeout(() => (awaitingG = false), 1000)
        }
        return
      }

      awaitingG = false
      const path = keyToPath[e.key.toLowerCase()]
      if (path) {
        e.preventDefault()
        router.push(path)
      }
    }

    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [router, shortcuts])

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
      case "audit-logs":
        return <AuditLogViewer />
      case "system":
        return <SystemTools />
      case "users":
        return <UserManagement />
      default:
        return <DashboardOverview />
    }
  }

  // Keyboard shortcut cheat sheet for help modal
  const helpShortcuts = [
    { combo: `g ${shortcuts.overview}`, description: "Go to Overview" },
    { combo: `g ${shortcuts.blogs}`, description: "Go to Blog Posts" },
    { combo: `g ${shortcuts.videos}`, description: "Go to Videos" },
    { combo: `g ${shortcuts.media}`, description: "Go to Media" },
    { combo: `g ${shortcuts.categories}`, description: "Go to Categories" },
    { combo: `g ${shortcuts.comments}`, description: "Go to Comments" },
    { combo: `g ${shortcuts.applications}`, description: "Go to Applications" },
    { combo: `g ${shortcuts.inbox}`, description: "Go to Inbox" },
    { combo: `g ${shortcuts.users}`, description: "Go to Users" },
    { combo: `g ${shortcuts.auditLogs}`, description: "Go to Audit Logs" },
    { combo: `g ${shortcuts.settings}`, description: "Go to Settings" },
    { combo: `g ${shortcuts.system}`, description: "Go to System" },
    { combo: "?", description: "Open this help" },
  ]

  return (
    <AdminAuthGuard>
      <RoleProvider>
        {/* ⬇️ Only this line changed per your request */}
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex overflow-x-hidden">
          <AdminSidebar
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />

          <div className="flex-1 flex flex-col">
            <AdminHeader
              onLogout={handleLogout}
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              onShowHelp={() => setHelpOpen(true)}
            />

            <main className="flex-1 p-6 overflow-auto">
              <div className="max-w-7xl mx-auto">
                {error && (
                  <Alert variant="destructive" className="mb-4 border-red-200 bg-red-50">
                    <AlertDescription className="text-red-700 text-sm">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}
                {/* 🟩 Accessible Suspense fallback */}
                <Suspense fallback={<Spinner className="py-4" aria-live="polite" />}>
                  <ErrorBoundary key={`${activeSection}-${refreshKey}`}>
                    {renderContent()}
                  </ErrorBoundary>
                </Suspense>
              </div>
            </main>
          </div>
        </div>
        <HelpModal open={helpOpen} setOpen={setHelpOpen} shortcuts={helpShortcuts} />
      </RoleProvider>
    </AdminAuthGuard>
  )
}
