"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { type UserRole, hasPermission, getAccessibleSections, type RolePermissions } from "@/lib/role-permissions"
import { clientEnv } from "@/env.client"

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
  const [debugInfo, setDebugInfo] = useState<{ role?: string; email?: string; uid?: string } | null>(null)

  // Utility to extract debug info from API error response
  const extractDebugInfo = (data: Record<string, unknown>) => ({
    role: typeof data.role === "string" ? data.role : "unknown",
    email: typeof data.email === "string" ? data.email : "unknown",
    uid: typeof data.uid === "string" ? data.uid : "unknown",
  })

  const fetchUserRole = async () => {
    try {
      setIsLoading(true)
      setError(null)
      setDebugInfo(null)
      const res = await fetch("/api/admin/user-role", { credentials: "include" })
      // Always parse, even on error
      const data = await res.json().catch(() => ({}))
      if (res.status === 401) {
        // Not logged in; redirect to login
        window.location.href = "/admin/login"
        return
      }
      if (!res.ok) {
        setError((data as Record<string, unknown>).error as string || "Failed to fetch role")
        if (clientEnv.NODE_ENV !== "production") {
          setDebugInfo(extractDebugInfo(data as Record<string, unknown>))
        }
        return
      }
      if (data.role === "admin" || data.role === "editor" || data.role === "support") {
        setUserRole(data.role as UserRole)
      } else {
        setError("Unknown role")
        if (clientEnv.NODE_ENV !== "production") {
          setDebugInfo(extractDebugInfo(data as Record<string, unknown>))
        }
      }
    } catch (error) {
      console.error("Failed to fetch user role:", error)
      setError("Network error")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUserRole()
    // eslint-disable-next-line
  }, [])

  const checkPermission = (permission: string) => {
    return hasPermission(userRole, permission as keyof RolePermissions)
  }

  const accessibleSections = getAccessibleSections(userRole)

  // Show error overlay if any error (except during loading)
  if (error && !isLoading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "red" }}>
        <h2>Unable to load dashboard</h2>
        <p>{error}</p>
        {clientEnv.NODE_ENV !== "production" && debugInfo && (
          <div style={{ color: "#666", fontSize: "12px", margin: "12px 0" }}>
            <div>Role: {debugInfo.role}</div>
            <div>Email: {debugInfo.email}</div>
            <div>UID: {debugInfo.uid}</div>
          </div>
        )}
        <button onClick={fetchUserRole}>Retry</button>
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
