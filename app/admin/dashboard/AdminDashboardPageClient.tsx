"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import dynamic from "next/dynamic"
import { usePathname, useRouter } from "next/navigation"
import { getAuth, signOut } from "firebase/auth"
import app, { firebaseInitError } from "@/lib/firebase"
import useHotkeys from "./hooks/use-hotkeys"

import AdminAuthGuard from "@/components/AdminAuthGuard"
import { AdminSidebar } from "./components/admin-sidebar"
import { AdminHeader } from "./components/admin-header"
import { RoleProvider } from "./contexts/role-context"
import { ToastProvider } from "./components/ui/toast-provider"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Spinner from "@/components/ui/spinner"
import MobileNav from "./components/mobile-nav"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

// Lazy sections
const DashboardOverview = dynamic(() => import("./components/dashboard-overview"), { ssr: false, loading: () => <Spinner /> })
const BlogManager = dynamic(() => import("./components/blog-manager"), { ssr: false, loading: () => <Spinner /> })
const VideoManager = dynamic(() => import("./components/video-manager"), { ssr: false, loading: () => <Spinner /> })
const CommentManager = dynamic(() => import("./components/comment-manager"), { ssr: false, loading: () => <Spinner /> })
const SystemTools = dynamic(() => import("./components/system-tools"), { ssr: false, loading: () => <Spinner /> })
const UserManagement = dynamic(() => import("./components/user-management/UserManagement"), { ssr: false, loading: () => <Spinner /> })
const CategoryManager = dynamic(() => import("@/components/admin/category/CategoryManager"), { ssr: false, loading: () => <Spinner /> })
const EmailInbox = dynamic(() => import("./components/email-inbox"), { ssr: false, loading: () => <Spinner /> })
const MediaLibrary = dynamic(() => import("./components/media/MediaLibrary"), { ssr: false, loading: () => <Spinner /> })
const CareerApplications = dynamic(() => import("./components/career-applications"), { ssr: false, loading: () => <Spinner /> })
const CommandPalette = dynamic(() => import("./components/command-palette"), { ssr: false })

interface AdminDashboardPageClientProps {
  initialSection?: string
}

export default function AdminDashboardPageClient({ initialSection = "overview" }: AdminDashboardPageClientProps) {
  const [activeSection, setActiveSection] = useState(initialSection)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState("")
  const [isMobile, setIsMobile] = useState(false)
  const [keyboardOpen, setKeyboardOpen] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useHotkeys("n", () => router.push("/admin/blog/create"), undefined, [router])
  useHotkeys("shift+u", () => window.dispatchEvent(new Event("admin-open-media-upload")))
  // aligned event name with AdminHeader/CommandPalette listener
  useHotkeys(["meta+/", "ctrl+/"], () => window.dispatchEvent(new Event("open-command-palette")))
  useHotkeys("?", (e) => { e.preventDefault(); setShortcutsOpen(true) })

  useEffect(() => {
    setMounted(true)
    fetch("/api/admin/init", { method: "POST" }).catch(err => {
      if (process.env.NODE_ENV !== "production") console.error("Admin init failed:", err)
    })
  }, [])

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
      { id: "system", href: "/admin/dashboard/system" }
    ]
    const matched = map.find(m => pathname === m.href || pathname.startsWith(`${m.href}/`))
    if (matched && matched.id !== activeSection) setActiveSection(matched.id)
  }, [pathname, activeSection])

  useEffect(() => {
    const interval = setInterval(() => {
      window.dispatchEvent(new CustomEvent("admin-refresh"))
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 1024)
      setIsMobile(window.innerWidth < 768)
      setKeyboardOpen(window.innerHeight < window.outerHeight - 150)
    }
    window.addEventListener("resize", handleResize)
    handleResize()
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const handleLogout = useCallback(async () => {
    try {
      if (firebaseInitError || !app) {
        setError(firebaseInitError?.message || "Firebase not initialized. Cannot log out safely.")
        return
      }
      await signOut(getAuth(app))
      await fetch("/api/admin/logout", { method: "POST" })
      window.location.href = "/admin/login"
    } catch (error) {
      setError("Logout failed. Please try again.")
      if (process.env.NODE_ENV !== "production") console.error("Logout failed:", error)
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
      case "overview": return <DashboardOverview />
      case "blogs": return <BlogManager />
      case "videos": return <VideoManager />
      case "media": return <MediaLibrary />
      case "categories": return <CategoryManager />
      case "comments": return <CommentManager />
      case "applications": return <CareerApplications />
      case "inbox": return <EmailInbox />
      case "system": return <SystemTools />
      case "users": return <UserManagement />
      default: return <DashboardOverview />
    }
  }

  return (
    <AdminAuthGuard>
      <ToastProvider>
        <RoleProvider>
          <CommandPalette />
          <div className="min-h-screen bg-gray-50 flex overflow-x-hidden">
            <AdminSidebar activeSection={activeSection} setActiveSection={setActiveSection} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className="flex-1 flex flex-col">
              <AdminHeader onLogout={handleLogout} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
              <main className="flex-1 p-6 overflow-auto">
                <div className="max-w-7xl mx-auto">
                  {error && (
                    <Alert variant="destructive" className="mb-4 border-red-200 bg-red-50">
                      <AlertDescription className="text-red-700 text-sm">{error}</AlertDescription>
                    </Alert>
                  )}
                  <Suspense fallback={<Spinner />}>{renderContent()}</Suspense>
                </div>
              </main>
              {isMobile && !keyboardOpen && (
                <MobileNav activeSection={activeSection} setActiveSection={setActiveSection} />
              )}
            </div>
          </div>
          <Dialog open={shortcutsOpen} onOpenChange={setShortcutsOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Keyboard Shortcuts</DialogTitle>
                <DialogDescription>Navigate the admin dashboard faster</DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm"><span>New blog post</span><kbd className="px-2 py-1 bg-muted rounded text-xs">n</kbd></div>
                <div className="flex items-center justify-between text-sm"><span>Upload media</span><kbd className="px-2 py-1 bg-muted rounded text-xs">shift + u</kbd></div>
                <div className="flex items-center justify-between text-sm"><span>Command palette</span><kbd className="px-2 py-1 bg-muted rounded text-xs">cmd/ctrl + /</kbd></div>
                <div className="flex items-center justify-between text-sm"><span>Show this help</span><kbd className="px-2 py-1 bg-muted rounded text-xs">?</kbd></div>
              </div>
            </DialogContent>
          </Dialog>
        </RoleProvider>
      </ToastProvider>
    </AdminAuthGuard>
  )
}
