"use client"
import React, { createContext, useContext, useEffect, useState } from "react"
import { onAuthStateChanged, signOut, User } from "firebase/auth"
import { getFirebaseAuth, firebaseInitError } from "@/lib/firebase"
import { Alert, AlertDescription } from "@/components/ui/alert"

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
    // Guard: If Firebase config error, do not register listener
    if (firebaseInitError) {
      setError(
        firebaseInitError.message ||
          "Firebase app failed to initialize due to misconfiguration."
      )
      setLoading(false)
      return
    }

    let auth
    try {
      auth = getFirebaseAuth()
    } catch {
      setError(
        firebaseInitError?.message ||
          "Firebase app failed to initialize due to misconfiguration."
      )
      setLoading(false)
      return
    }

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
        if (process.env.NODE_ENV !== "production") {
          console.error("[AdminAuthProvider] Auth listener error:", err)
        }
      }
    )
    return () => unsubscribe()
  }, [])

  // --- Codex Update: Also call /api/admin/logout after Firebase signOut
  const signOutAdmin = async () => {
    setLoading(true)
    setError(null)
    try {
      const auth = getFirebaseAuth()
      await signOut(auth)
      setUser(null)
      // Call backend to clear the admin-session cookie server-side
      await fetch("/api/admin/logout", { method: "POST" })
    } catch (err: unknown) {
      setError("Failed to sign out. Please try again.")
      if (process.env.NODE_ENV !== "production") {
        console.error("[AdminAuthProvider] Sign out error:", err)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminAuthContext.Provider value={{ user, loading, error, signOutAdmin }}>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription className="text-red-700 text-sm">
            {error}
          </AlertDescription>
        </Alert>
      )}
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
