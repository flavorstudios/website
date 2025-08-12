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
      if (window.innerWidth < 1024) {
        setSidebarOpen(false)
      } else {
        setSidebarOpen(true)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
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
      <AdminSidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader onLogout={handleLogout} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
