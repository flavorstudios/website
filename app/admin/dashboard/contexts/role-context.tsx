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
    // Simulate fetching user role from Firestore
    // In real implementation, this would fetch from /roles/{userId}
    const fetchUserRole = async () => {
      try {
        // Mock API call - replace with actual Firestore query
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // For demo, you can change this to test different roles
        const mockRole: UserRole = "admin" // Change to 'editor' or 'support' to test
        setUserRole(mockRole)
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
