"use client"
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react"
import { usePathname, useRouter } from "next/navigation"
import { onAuthStateChanged, signOut, User } from "firebase/auth"
import { getFirebaseAuth, firebaseInitError } from "@/lib/firebase"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { clientEnv } from "@/env.client"
import { isE2EEnabled } from "@/lib/e2e-utils"

const TEST_EMAIL_VERIFIED_STORAGE_KEY = "admin-test-email-verified"
const TEST_EMAIL_VERIFIED_EVENT_NAME = "admin-test-email-verified-change"
const TEST_MODE_OVERRIDE_STORAGE_KEY = "admin-test-mode"
const TEST_MODE_OVERRIDE_EVENT_NAME = "admin-test-mode-change"

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
  const e2eActive = isE2EEnabled()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(() => !e2eActive)
  const [error, setError] = useState<string | null>(null)
  const [authInitFailed, setAuthInitFailed] = useState(() =>
    Boolean(firebaseInitError)
  )
  const [testModeOverride, setTestModeOverride] = useState<boolean | null>(() => {
    if (typeof window === "undefined") {
      return null
    }
    const stored = window.localStorage.getItem(TEST_MODE_OVERRIDE_STORAGE_KEY)
    if (stored === null) {
      return null
    }
    return stored === "true"
  })
  const requiresVerification =
    clientEnv.NEXT_PUBLIC_REQUIRE_ADMIN_EMAIL_VERIFICATION === "true"
  const envTestMode = clientEnv.TEST_MODE === "true"
  const testMode = (testModeOverride ?? envTestMode) || authInitFailed
  const shouldUseTestVerification =
    !e2eActive && requiresVerification && testMode
  const isTestEnvironment = e2eActive
  const [testEmailVerified, setTestEmailVerifiedState] = useState<
    boolean | null
  >(() => {
    if (isTestEnvironment) {
      return true
    }
    if (!shouldUseTestVerification || typeof window === "undefined") {
      return null
    }
    const stored = window.localStorage.getItem(
      TEST_EMAIL_VERIFIED_STORAGE_KEY
    )
    if (stored === null) {
      return null
    }
    return stored === "true"
  })
  const firebaseErrorMessage = (firebaseInitError as Error | null | undefined)?.message
  const router = useRouter()
  const pathname = usePathname()

  const readTestEmailVerifiedSync = useCallback(() => {
    if (!shouldUseTestVerification || typeof window === "undefined") {
      return null
    }
    const stored = window.localStorage.getItem(TEST_EMAIL_VERIFIED_STORAGE_KEY)
    if (stored === null) {
      return null
    }
    return stored === "true"
  }, [shouldUseTestVerification])

  type VerificationStatus = "pending" | "verified" | "unverified"

  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>(
    () => {
      if (!requiresVerification || isTestEnvironment) {
        return "verified"
      }
      if (shouldUseTestVerification) {
        const syncValue = readTestEmailVerifiedSync()
        const effectiveValue = syncValue ?? testEmailVerified
        if (effectiveValue === true) {
          return "verified"
        }
        if (effectiveValue === false) {
          return "unverified"
        }
        return "pending"
      }
      if (loading) {
        return "pending"
      }
      if (!user) {
        return "verified"
      }
      return user.emailVerified ? "verified" : "unverified"
    }
  )

  const updateVerificationStatus = useCallback((next: VerificationStatus) => {
    setVerificationStatus((current) => (current === next ? current : next))
  }, [])

  const isGuardedAdminRoute = useMemo(() => {
    if (!pathname?.startsWith("/admin")) {
      return false
    }
    
    const unguardedPrefixes = [
      "/admin/login",
      "/admin/forgot-password",
      "/admin/signup",
      "/admin/verify-email",
      "/admin/preview",
    ]

    return !unguardedPrefixes.some((prefix) => {
      if (pathname === prefix) return true
      if (pathname.startsWith(`${prefix}/`)) return true
      if (pathname.startsWith(`${prefix}?`)) return true
      return false
    })
  }, [pathname])

  const persistTestEmailVerified = useCallback(
    (value: boolean | null) => {
      if (!shouldUseTestVerification) {
        setTestEmailVerifiedState(value)
        return
      }
      if (typeof window !== "undefined") {
        if (value === null) {
          window.localStorage.removeItem(TEST_EMAIL_VERIFIED_STORAGE_KEY)
        } else {
          window.localStorage.setItem(
            TEST_EMAIL_VERIFIED_STORAGE_KEY,
            value ? "true" : "false"
          )
        }

        window.dispatchEvent(
          new CustomEvent<{ value: boolean | null }>(
            TEST_EMAIL_VERIFIED_EVENT_NAME,
            {
              detail: { value },
            }
          )
        )
      }
      setTestEmailVerifiedState(value)
    },
    [shouldUseTestVerification]
  )

  useEffect(() => {
    if (!shouldUseTestVerification || typeof window === "undefined") {
      return
    }
    const stored = window.localStorage.getItem(
      TEST_EMAIL_VERIFIED_STORAGE_KEY
    )
    if (stored === null) {
      persistTestEmailVerified(false)
    }
  }, [persistTestEmailVerified, shouldUseTestVerification])

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    if (!shouldUseTestVerification) {
      if (!isTestEnvironment) {
        setTestEmailVerifiedState(null)
      }
      return
    }

    const stored = window.localStorage.getItem(TEST_EMAIL_VERIFIED_STORAGE_KEY)
    if (stored === null) {
      setTestEmailVerifiedState(null)
      return
    }
    setTestEmailVerifiedState(stored === "true")
  }, [isTestEnvironment, shouldUseTestVerification])

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const readOverride = () => {
      const stored = window.localStorage.getItem(TEST_MODE_OVERRIDE_STORAGE_KEY)
      if (stored === null) {
        setTestModeOverride(null)
        return
      }
      setTestModeOverride(stored === "true")
    }

    readOverride()

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key !== TEST_MODE_OVERRIDE_STORAGE_KEY) {
        return
      }
      const nextValue = event.newValue === null ? null : event.newValue === "true"
      setTestModeOverride(nextValue)
    }

    const handleCustomEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{ value: boolean | null }>
      setTestModeOverride(customEvent.detail?.value ?? null)
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener(
      TEST_MODE_OVERRIDE_EVENT_NAME,
      handleCustomEvent as EventListener
    )

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener(
        TEST_MODE_OVERRIDE_EVENT_NAME,
        handleCustomEvent as EventListener
      )
    }
  }, [])

  useEffect(() => {
    if (!shouldUseTestVerification || typeof window === "undefined") {
      return
    }

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key !== TEST_EMAIL_VERIFIED_STORAGE_KEY) {
        return
      }
      const nextValue = event.newValue === null ? null : event.newValue === "true"
      setTestEmailVerifiedState(nextValue)
    }

    const handleCustomEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{ value: boolean | null }>
      setTestEmailVerifiedState(customEvent.detail?.value ?? null)
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener(
      TEST_EMAIL_VERIFIED_EVENT_NAME,
      handleCustomEvent as EventListener
    )
    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener(
        TEST_EMAIL_VERIFIED_EVENT_NAME,
        handleCustomEvent as EventListener
      )
    }
  }, [shouldUseTestVerification])

  useEffect(() => {
    // Guard: If Firebase config error, do not register listener
    if (authInitFailed || firebaseInitError) {
      setAuthInitFailed(true)
      setLoading(false)
      return
    }

    if (testModeOverride === true) {
      setLoading(false)
      return
    }

    let auth
    try {
      auth = getFirebaseAuth()
    } catch (err) {
      setAuthInitFailed(true)
      setLoading(false)
      if (clientEnv.NODE_ENV !== "production") {
        console.error("[AdminAuthProvider] Firebase init error:", err)
      }
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
  }, [authInitFailed, firebaseErrorMessage, testModeOverride])

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

  useLayoutEffect(() => {
    if (!requiresVerification || isTestEnvironment) {
      updateVerificationStatus("verified")
      if (
        isTestEnvironment &&
        pathname?.startsWith("/admin/verify-email")
      ) {
        router.replace("/admin/dashboard")
      }
      return
    }

    if (shouldUseTestVerification) {
      const syncValue = readTestEmailVerifiedSync()
      const effectiveValue = syncValue ?? testEmailVerified

      if (effectiveValue === true) {
        updateVerificationStatus("verified")
        if (pathname?.startsWith("/admin/verify-email")) {
          router.replace("/admin/dashboard")
        }
        return
      }

      updateVerificationStatus("unverified")
      if (
        pathname &&
        !pathname.startsWith("/admin/verify-email") &&
        pathname !== "/admin/signup"
      ) {
        router.replace("/admin/verify-email")
      }
      return
    }

    if (loading) {
      updateVerificationStatus("pending")
      return
    }

    if (!user) {
      updateVerificationStatus("verified")
      return
    }

    if (user.emailVerified) {
      updateVerificationStatus("verified")
      if (pathname?.startsWith("/admin/verify-email")) {
        router.replace("/admin/dashboard")
      }
      return
    }

    updateVerificationStatus("unverified")
    if (
      pathname &&
      !pathname.startsWith("/admin/verify-email") &&
      pathname !== "/admin/signup"
    ) {
      router.replace("/admin/verify-email")
    }
  }, [
    isTestEnvironment,
    loading,
    pathname,
    readTestEmailVerifiedSync,
    requiresVerification,
    router,
    testEmailVerified,
    shouldUseTestVerification,
    updateVerificationStatus,
    user,
  ])

  const shouldBlockChildren =
    requiresVerification &&
    !isTestEnvironment &&
    isGuardedAdminRoute &&
    verificationStatus !== "verified"

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
      {shouldBlockChildren ? (
        <div className="flex min-h-[50vh] w-full items-center justify-center">
          <p className="text-sm text-muted-foreground">Checking admin access…</p>
        </div>
      ) : (
        children
      )}
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
