"use client"
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { usePathname, useRouter } from "next/navigation"
import { onAuthStateChanged, signOut, User } from "firebase/auth"
import { getFirebaseAuth, firebaseInitError } from "@/lib/firebase"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { clientEnv } from "@/env.client"
import { isE2EEnabled } from "@/lib/e2e-utils"
import { isTestMode } from "@/config/flags"
import { syncAdminSession } from "@/lib/admin-session-sync"

const TEST_EMAIL_VERIFIED_STORAGE_KEY = "admin-test-email-verified"
const TEST_EMAIL_VERIFIED_EVENT_NAME = "admin-test-email-verified-change"
const TEST_MODE_OVERRIDE_STORAGE_KEY = "admin-test-mode"
const TEST_MODE_OVERRIDE_EVENT_NAME = "admin-test-mode-change"

type AdminAccessState =
  | "loading"
  | "unauthenticated"
  | "authenticated_unverified"
  | "authenticated_verified"

type ServerVerificationState = "unknown" | "unverified" | "verified"

// ---- Define Context Shape ----
interface AdminAuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  signOutAdmin: () => Promise<void>
  testEmailVerified: boolean | null
  setTestEmailVerified: (value: boolean | null) => void
  refreshCurrentUser: () => Promise<User | null>
  accessState: AdminAccessState
  requiresVerification: boolean
  serverVerification: ServerVerificationState
  sessionSyncing: boolean
  syncServerSession: () => Promise<boolean>
}

// ---- Create Context ----
const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

// ---- Provider Implementation ----
export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const e2eActive = isE2EEnabled()
  const [userSnapshot, setUserSnapshot] = useState<{ user: User | null; version: number }>(
    () => ({ user: null, version: 0 })
  )
  const user = userSnapshot.user
  const userVersion = userSnapshot.version
  const [loading, setLoading] = useState(() => !e2eActive)
  const [error, setError] = useState<string | null>(null)
  const [authInitFailed, setAuthInitFailed] = useState(() =>
    Boolean(firebaseInitError)
  )
  const [serverVerification, setServerVerification] =
    useState<ServerVerificationState>("unknown")
  const [sessionSyncing, setSessionSyncing] = useState(false)
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
  const envTestMode = isTestMode()
  const testMode = (testModeOverride ?? envTestMode) || authInitFailed
  const shouldUseLocalVerification =
    requiresVerification && (testMode || e2eActive)
  const [testEmailVerified, setTestEmailVerifiedState] = useState<
    boolean | null
  >(() => {
    if (!shouldUseLocalVerification) {
      return null
    }
    if (typeof window === "undefined") {
      return e2eActive ? false : null
    }
    const stored = window.localStorage.getItem(
      TEST_EMAIL_VERIFIED_STORAGE_KEY
    )
    if (stored === null) {
      if (e2eActive) {
        window.localStorage.setItem(TEST_EMAIL_VERIFIED_STORAGE_KEY, "false")
      }
      return e2eActive ? false : null
    }
    return stored === "true"
  })
  const firebaseErrorMessage = (firebaseInitError as Error | null | undefined)?.message
  const router = useRouter()
  const pathname = usePathname()

  const commitUser = useCallback((next: User | null) => {
    setUserSnapshot((prev) => ({ user: next, version: prev.version + 1 }))
  }, [])

  const readTestEmailVerifiedSync = useCallback(() => {
    if (!shouldUseLocalVerification || typeof window === "undefined") {
      return shouldUseLocalVerification && e2eActive ? false : null
    }
    const stored = window.localStorage.getItem(TEST_EMAIL_VERIFIED_STORAGE_KEY)
    if (stored === null) {
      return shouldUseLocalVerification && e2eActive ? false : null
    }
    return stored === "true"
  }, [shouldUseLocalVerification, e2eActive])

  const accessState = useMemo<AdminAccessState>(() => {
    if (loading) {
      return "loading"
    }

  if (!requiresVerification) {
      return user ? "authenticated_verified" : "unauthenticated"
    }

  if (shouldUseLocalVerification) {
      const syncValue = readTestEmailVerifiedSync()
      const effectiveValue = syncValue ?? testEmailVerified
      return effectiveValue ? "authenticated_verified" : "authenticated_unverified"
    }

    if (!user) {
      return "unauthenticated"
    }

    return user.emailVerified
      ? "authenticated_verified"
      : "authenticated_unverified"
  }, [
    loading,
    readTestEmailVerifiedSync,
    requiresVerification,
    shouldUseLocalVerification,
    testEmailVerified,
    user,
  ])

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
      if (!shouldUseLocalVerification || typeof window === "undefined") {
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
      }

      window.dispatchEvent(
        new CustomEvent<{ value: boolean | null }>(
          TEST_EMAIL_VERIFIED_EVENT_NAME,
          {
            detail: { value },
          }
        )
      )

      setTestEmailVerifiedState(value)
    },
    [shouldUseLocalVerification]
  )

  useEffect(() => {
    if (!shouldUseLocalVerification || typeof window === "undefined") {
      return
    }
    const stored = window.localStorage.getItem(
      TEST_EMAIL_VERIFIED_STORAGE_KEY
    )
    if (stored === null) {
      persistTestEmailVerified(false)
    }
  }, [persistTestEmailVerified, shouldUseLocalVerification])

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    if (!shouldUseLocalVerification) {
      setTestEmailVerifiedState(null)
      return
    }

    const stored = window.localStorage.getItem(TEST_EMAIL_VERIFIED_STORAGE_KEY)
    if (stored === null) {
      if (e2eActive) {
        window.localStorage.setItem(TEST_EMAIL_VERIFIED_STORAGE_KEY, "false")
        setTestEmailVerifiedState(false)
      } else {
        setTestEmailVerifiedState(null)
      }
      return
    }
    setTestEmailVerifiedState(stored === "true")
  }, [shouldUseLocalVerification, e2eActive])

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
    if (!shouldUseLocalVerification || typeof window === "undefined") {
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
  }, [shouldUseLocalVerification])

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
        commitUser(firebaseUser)
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
  }, [authInitFailed, commitUser, firebaseErrorMessage, testModeOverride])

  const refreshCurrentUser = useCallback(async () => {
    try {
      const auth = getFirebaseAuth()
      const current = auth.currentUser
      if (!current) {
        commitUser(null)
        return null
      }
      await current.reload()
      commitUser(auth.currentUser)
      return auth.currentUser
    } catch (err) {
      if (clientEnv.NODE_ENV !== "production") {
        console.error("[AdminAuthProvider] Failed to refresh current user:", err)
      }
      throw err
    }
  }, [commitUser])

  const syncServerSession = useCallback(async () => {
    if (!requiresVerification || shouldUseLocalVerification) {
      setServerVerification("verified")
      return true
    }

    if (!user || sessionSyncing) {
      return false
    }

    setSessionSyncing(true)
    try {
      const synced = await syncAdminSession(user)
      if (synced) {
        setServerVerification("verified")
      }
      return synced
    } catch (error) {
      if (clientEnv.NODE_ENV !== "production") {
        console.error("[AdminAuthProvider] Session sync failed", error)
      }
      return false
    } finally {
      setSessionSyncing(false)
    }
  }, [
    requiresVerification,
    sessionSyncing,
    shouldUseLocalVerification,
    user,
  ])

  // --- Codex Update: Also call /api/admin/logout after Firebase signOut
  const signOutAdmin = async () => {
    setLoading(true)
    setError(null)
    try {
      const auth = getFirebaseAuth()
      await signOut(auth)
      commitUser(null)
      persistTestEmailVerified(null)
      setServerVerification("unknown")
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
    if (!pathname?.startsWith("/admin")) {
      return
    }

    if (accessState === "loading") {
      return
    }

    const isVerifyRoute = pathname.startsWith("/admin/verify-email")
    const isLoginRoute = pathname.startsWith("/admin/login")
    const isForgotPasswordRoute = pathname.startsWith("/admin/forgot-password")
    const isSignupRoute = pathname.startsWith("/admin/signup")
    const isPreviewRoute = pathname.startsWith("/admin/preview")

    if (isPreviewRoute) {
      return
    }

    let nextPath: string | null = null

    if (accessState === "unauthenticated") {
      if (!isLoginRoute && !isSignupRoute && !isForgotPasswordRoute) {
        nextPath = "/admin/login"
      }
    } else if (accessState === "authenticated_unverified") {
      if (!isVerifyRoute) {
        nextPath = "/admin/verify-email"
      }
    } else if (accessState === "authenticated_verified") {
      if (
        isVerifyRoute &&
        (!requiresVerification || serverVerification === "verified")
      ) {
        nextPath = "/admin/dashboard"
      }
    }

    if (nextPath && nextPath !== pathname) {
      router.replace(nextPath)
    }
  }, [
    accessState,
    pathname,
    requiresVerification,
    router,
    serverVerification,
  ])

  const shouldBlockChildren =
    isGuardedAdminRoute &&
    (accessState === "loading" || accessState === "authenticated_unverified")

  useEffect(() => {
    if (!requiresVerification || shouldUseLocalVerification) {
      setServerVerification("verified")
      return
    }

    if (!user) {
      setServerVerification("unknown")
      return
    }

    let cancelled = false

    const fetchServerState = async () => {
      try {
        const response = await fetch("/api/admin/verification-status", {
          credentials: "include",
          cache: "no-store",
        })
        if (!response.ok) {
          if (!cancelled) {
            setServerVerification("unknown")
          }
          return
        }
        const data = (await response.json()) as {
          serverStateKnown: boolean
          serverVerified: boolean
        }
        if (cancelled) {
          return
        }
        if (data.serverStateKnown) {
          setServerVerification(data.serverVerified ? "verified" : "unverified")
        } else {
          setServerVerification("unknown")
        }
      } catch {
        if (!cancelled) {
          setServerVerification("unknown")
        }
      }
    }

    fetchServerState()
    return () => {
      cancelled = true
    }
  }, [requiresVerification, shouldUseLocalVerification, user, userVersion])

  useEffect(() => {
    if (
      !requiresVerification ||
      shouldUseLocalVerification ||
      accessState !== "authenticated_verified" ||
      serverVerification === "verified"
    ) {
      return
    }

    void syncServerSession()
  }, [
    accessState,
    requiresVerification,
    serverVerification,
    shouldUseLocalVerification,
    syncServerSession,
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
        refreshCurrentUser,
        accessState,
        requiresVerification,
        serverVerification,
        sessionSyncing,
        syncServerSession,
      }}
    >
      {error && (
        <Alert
          variant="destructive"
          className="mb-4"
          role="status"
          aria-live="polite"
        >
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
