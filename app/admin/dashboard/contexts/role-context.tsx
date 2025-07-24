"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { type UserRole, hasPermission, getAccessibleSections } from "@/lib/role-permissions"

interface RoleContextType {
  userRole: UserRole
  setUserRole: (role: UserRole) => void
  hasPermission: (permission: string) => boolean
  accessibleSections: string[]
  isLoading: boolean
  error: string | null
}

const RoleContext = createContext<RoleContextType | undefined>(undefined)

export function RoleProvider({ children }: { children: ReactNode }) {
  const [userRole, setUserRole] = useState<UserRole>("admin")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const res = await fetch("/api/admin/user-role", { credentials: "include" })
        if (res.status === 401) {
          // Not logged in; redirect to login
          window.location.href = "/admin/login"
          return
        }
        // --- NEW: Always parse, even on error
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          setError(data.error || "Failed to fetch role")
          return
        }
        if (data.role === "admin" || data.role === "editor" || data.role === "support") {
          setUserRole(data.role as UserRole)
        } else {
          setError("Unknown role")
        }
      } catch (error) {
        console.error("Failed to fetch user role:", error)
        setError("Network error")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserRole()
  }, [])

  const checkPermission = (permission: string) => {
    return hasPermission(userRole, permission as any)
  }

  const accessibleSections = getAccessibleSections(userRole)

  // Show error overlay if any error (except during loading)
  if (error && !isLoading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "red" }}>
        <h2>Unable to load dashboard</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    )
  }

  return (
    <RoleContext.Provider
      value={{
        userRole,
        setUserRole,
        hasPermission: checkPermission,
        accessibleSections,
        isLoading,
        error,
      }}
    >
      {children}
    </RoleContext.Provider>
  )
}

export function useRole() {
  const context = useContext(RoleContext)
  if (context === undefined) {
    throw new Error("useRole must be used within a RoleProvider")
  }
  return context
}
