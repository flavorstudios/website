"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { type UserRole, hasPermission, getAccessibleSections } from "@/lib/role-permissions"

interface RoleContextType {
  userRole: UserRole
  setUserRole: (role: UserRole) => void
  hasPermission: (permission: string) => boolean
  accessibleSections: string[]
  isLoading: boolean
}

const RoleContext = createContext<RoleContextType | undefined>(undefined)

export function RoleProvider({ children }: { children: ReactNode }) {
  const [userRole, setUserRole] = useState<UserRole>("admin") // Default to admin
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Fetch user role from API endpoint
    const fetchUserRole = async () => {
      try {
        const res = await fetch("/api/admin/user-role")
        const data = await res.json()
        if (res.ok && data.role) {
          setUserRole(data.role as UserRole)
        } else {
          setUserRole("support")
        }
      } catch (error) {
        console.error("Failed to fetch user role:", error)
        setUserRole("support") // Fallback to most restrictive role
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

  return (
    <RoleContext.Provider
      value={{
        userRole,
        setUserRole,
        hasPermission: checkPermission,
        accessibleSections,
        isLoading,
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
