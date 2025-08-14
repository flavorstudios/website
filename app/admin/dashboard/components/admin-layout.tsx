// app/admin/dashboard/components/admin-layout.tsx
"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { AdminSidebar } from "./admin-sidebar"
import { AdminHeader } from "./admin-header"

interface AdminLayoutProps {
  children: React.ReactNode
  activeSection: string
  setActiveSection: (section: string) => void
}

const AdminLayout = ({ children, activeSection, setActiveSection }: AdminLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 1024)
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && window.innerWidth < 1024) {
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
      {/* Provide an element for aria-controls from the header */}
      <div id="admin-sidebar">
        <AdminSidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader onLogout={handleLogout} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main id="main" tabIndex={-1} className="flex-1 overflow-y-auto">
          <div className="min-h-screen max-w-screen-xl mx-auto p-4 sm:p-6 pb-[env(safe-area-inset-bottom)]">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
