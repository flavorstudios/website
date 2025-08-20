// app/admin/dashboard/components/admin-layout.tsx
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { AdminSidebar } from "./admin-sidebar"
import { AdminHeader } from "./admin-header"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import BottomNav from "./bottom-nav"

interface AdminLayoutProps {
  children: React.ReactNode
  activeSection: string
  setActiveSection: (section: string) => void
}

const AdminLayout = ({ children, activeSection, setActiveSection }: AdminLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      setSidebarOpen(!mobile) // open sidebar on desktop, closed on mobile by default
    }

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobile) {
        setSidebarOpen(false)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    window.addEventListener("keydown", handleKey)

    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("keydown", handleKey)
    }
  }, [isMobile])

  // Expose sidebar width globally so body-portaled overlays can read it
  useEffect(() => {
    const width = sidebarOpen ? "16rem" : "5rem"
    const root = document.documentElement
    root.style.setProperty("--sidebar-w", width)
    return () => {
      root.style.removeProperty("--sidebar-w")
    }
  }, [sidebarOpen])

  // --- Updated to use the new logout endpoint ---
  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" }) // <<--- UPDATED ENDPOINT
      window.location.href = "/admin/login"
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-lg font-medium text-foreground">Loading Admin Dashboard...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      {isMobile ? (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="p-0 w-64">
            <AdminSidebar
              id="app-sidebar"
              activeSection={activeSection}
              setActiveSection={setActiveSection}
              sidebarOpen={true}
              setSidebarOpen={setSidebarOpen}
            />
          </SheetContent>
        </Sheet>
      ) : (
        <AdminSidebar
          id="app-sidebar"
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 pb-12 md:pb-0">
        <AdminHeader onLogout={handleLogout} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Padding matches ADMIN_HEADER_HEIGHT (h-14 = 56px) */}
        <main id="app-main" tabIndex={-1} className="relative flex-1 overflow-y-auto overflow-x-hidden pt-14">
          <div className="min-h-screen max-w-screen-xl mx-auto w-full p-4 sm:p-6 pb-[env(safe-area-inset-bottom)]">
            {children}
          </div>
        </main>

        {isMobile && <BottomNav />}
      </div>
    </div>
  )
}

export default AdminLayout
