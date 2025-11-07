// app/admin/dashboard/components/admin-layout.tsx
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { AdminSidebar } from "./admin-sidebar"
import { AdminHeader } from "./admin-header"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import BottomNav from "./bottom-nav"
import { SectionId } from "../sections"
import { logClientError } from "@/lib/log-client"

interface AdminLayoutProps {
  children: React.ReactNode
  activeSection: SectionId
  setActiveSection: React.Dispatch<React.SetStateAction<SectionId>>
}

const AdminLayout = ({ children, activeSection, setActiveSection }: AdminLayoutProps) => {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") {
      return true
    }
    return window.innerWidth < 768
  })
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window === "undefined") {
      return false
    }
    return window.innerWidth >= 768
  })

  useEffect(() => {
    const computeIsMobile = () => window.innerWidth < 768

    const handleResize = () => {
      const mobile = computeIsMobile()
      setIsMobile(mobile)
      setSidebarOpen(mobile ? false : true)
    }

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && computeIsMobile()) {
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
  }, [])

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
      logClientError("Logout failed:", error)
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      {isMobile ? (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="p-0 w-64 z-[1000]" hideOverlay asChild>
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
        <section
          id="admin-layout-main"
          tabIndex={-1}
          className="relative flex-1 overflow-y-auto overflow-x-hidden pt-14"
          role="region"
          aria-label="Admin content"
        >
          <div className="min-h-screen max-w-screen-xl mx-auto w-full p-4 sm:p-6 pb-[env(safe-area-inset-bottom)]">
            {children}
          </div>
        </section>

        {isMobile && <BottomNav />}
      </div>
    </div>
  )
}

export default AdminLayout
