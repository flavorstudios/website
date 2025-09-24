"use client"
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"
import { usePathname, useRouter } from "next/navigation"
import { onAuthStateChanged, signOut, User } from "firebase/auth"
import { getFirebaseAuth, firebaseInitError } from "@/lib/firebase"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { clientEnv } from "@/env.client"

// ---- Define Context Shape ----
interface AdminAuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  signOutAdmin: () => Promise<void>
  testEmailVerified: boolean | null
  setTestEmailVerified: (value: boolean | null) => void
}

// ---- Create Context ----
const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

// ---- Provider Implementation ----
export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [testEmailVerified, setTestEmailVerifiedState] = useState<
    boolean | null
  >(() => {
    if (typeof window === "undefined") {
      return null
    }
    const stored = window.localStorage.getItem("admin-test-email-verified")
    if (stored === null) {
      return null
    }
    return stored === "true"
  })
  const firebaseErrorMessage = (firebaseInitError as Error | null | undefined)?.message
  const router = useRouter()
  const pathname = usePathname()
  const requiresVerification =
    clientEnv.NEXT_PUBLIC_REQUIRE_ADMIN_EMAIL_VERIFICATION === "true"
  const testMode = clientEnv.TEST_MODE === "true"

  const persistTestEmailVerified = useCallback(
    (value: boolean | null) => {
      if (typeof window !== "undefined") {
        if (value === null) {
          window.localStorage.removeItem("admin-test-email-verified")
        } else {
          window.localStorage.setItem(
            "admin-test-email-verified",
            value ? "true" : "false"
          )
        }
      }
      setTestEmailVerifiedState(value)
    },
    []
  )

  useEffect(() => {
    if (!testMode || typeof window === "undefined") {
      return
    }

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key !== "admin-test-email-verified") {
        return
      }
      const nextValue = event.newValue === null ? null : event.newValue === "true"
      setTestEmailVerifiedState(nextValue)
    }

    window.addEventListener("storage", handleStorageChange)
    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [testMode])

  useEffect(() => {
    // Guard: If Firebase config error, do not register listener
    if (firebaseInitError) {
      setError(
        firebaseErrorMessage ||
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
        firebaseErrorMessage ||
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
        if (clientEnv.NODE_ENV !== "production") {
          console.error("[AdminAuthProvider] Auth listener error:", err)
        }
      }
    )
    return () => unsubscribe()
  }, [firebaseErrorMessage])

  // --- Codex Update: Also call /api/admin/logout after Firebase signOut
  const signOutAdmin = async () => {
    setLoading(true)
    setError(null)
    try {
      const auth = getFirebaseAuth()
      await signOut(auth)
      setUser(null)
      persistTestEmailVerified(null)
      // Call backend to clear the admin-session cookie server-side
      await fetch("/api/admin/logout", { method: "POST" })
    } catch (err: unknown) {
      setError("Failed to log out. Please try again.")
      if (clientEnv.NODE_ENV !== "production") {
        console.error("[AdminAuthProvider] Log out error:", err)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!requiresVerification) {
      return
    }

    if (!testMode && loading) {
      return
    }
    const currentPath = pathname || ""
    const testVerified = testMode ? testEmailVerified ?? false : undefined
    const isVerified = (testVerified ?? user?.emailVerified) ?? false
    const hasSession = testMode ? true : !!user

    if (hasSession && !isVerified) {
      if (!currentPath.startsWith("/admin/verify-email") && currentPath !== "/admin/signup") {
        router.replace("/admin/verify-email")
      }
    } else if (hasSession && isVerified && currentPath.startsWith("/admin/verify-email")) {
      router.replace("/admin/dashboard")
    }
  }, [
    requiresVerification,
    user,
    loading,
    pathname,
    router,
    testMode,
    testEmailVerified,
  ])


  return (
    <AdminAuthContext.Provider
      value={{
        user,
        loading,
        error,
        signOutAdmin,
        testEmailVerified,
        setTestEmailVerified: persistTestEmailVerified,
      }}
    >
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
