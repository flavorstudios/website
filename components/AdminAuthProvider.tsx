"use client"
import React, { createContext, useContext, useEffect, useState } from "react"
import { getAuth, onAuthStateChanged, signOut, User } from "firebase/auth"
import app from "@/lib/firebase"

// ---- Define Context Shape ----
interface AdminAuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  signOutAdmin: () => Promise<void>
}

// ---- Create Context ----
const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

// ---- Provider Implementation ----
export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const auth = getAuth(app)
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        setUser(firebaseUser)
        setLoading(false)
      },
      (err) => {
        setError("Authentication error.")
        setLoading(false)
        // Optionally log the error for devs
        console.error("[AdminAuthProvider] Auth listener error:", err)
      }
    )
    return () => unsubscribe()
  }, [])

  // --- Codex Update: Also call /api/admin/logout after Firebase signOut
  const signOutAdmin = async () => {
    setLoading(true)
    setError(null)
    try {
      await signOut(getAuth(app))
      setUser(null)
      // Call backend to clear the admin-session cookie server-side
      await fetch("/api/admin/logout", { method: "POST" })
    } catch (err: any) {
      setError("Failed to sign out. Please try again.")
      console.error("[AdminAuthProvider] Sign out error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminAuthContext.Provider value={{ user, loading, error, signOutAdmin }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

// ---- Custom Hook for easy consumption ----
export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider")
  }
  return context
}
