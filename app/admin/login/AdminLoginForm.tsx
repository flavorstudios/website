"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import FirebaseEmailLoginForm from "./FirebaseEmailLoginForm"
import EmailLoginForm from "./EmailLoginForm"
import useAuthError from "@/hooks/useAuthError"
import { clientEnv } from "@/env.client"

// --- Firebase Auth (client-only getters) ---
import { getFirebaseAuth, firebaseInitError } from "@/lib/firebase"
import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  User,
  signOut,
} from "firebase/auth"
import { FirebaseError } from "firebase/app"

// Safe client-side error logger (dev only)
function safeLogError(...args: unknown[]) {
  if (clientEnv.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.error(...args)
  }
}

// Helper to validate the admin session on the server
const checkServerSession = async () =>
  (
    await fetch("/api/admin/validate-session", {
      credentials: "include",
    })
  ).ok

const GoogleIcon = () => (
  <svg
    aria-hidden="true"
    focusable="false"
    width="18"
    height="18"
    viewBox="0 0 18 18"
    xmlns="http://www.w3.org/2000/svg"
    className="h-[18px] w-[18px]"
  >
    <path
      fill="#4285F4"
      d="M17.64 9.2045c0-.6382-.0573-1.2518-.1636-1.8364H9v3.4728h4.8445c-.2091 1.125-.8455 2.0782-1.7991 2.7164v2.2564h2.9086c1.7018-1.5664 2.6864-3.8745 2.6864-6.6092z"
    />
    <path
      fill="#34A853"
      d="M9 18c2.43 0 4.4673-.806 5.9564-2.1882l-2.9086-2.2564c-.8054.54-1.8382.86-3.0478.86-2.3441 0-4.3295-1.5818-5.0373-3.7109H.9845v2.3318C2.4641 15.9836 5.4909 18 9 18z"
    />
    <path
      fill="#FBBC05"
      d="M3.9627 10.7045c-.18-.54-.2823-1.1164-.2823-1.7045s.1023-1.1645.2823-1.7045V4.9636H.9845C.3564 6.1732 0 7.5486 0 9s.3564 2.8268.9845 4.0364l2.9782-2.3319z"
    />
    <path
      fill="#EA4335"
      d="M9 3.5795c1.3214 0 2.5077.4541 3.4391 1.3459l2.5796-2.5795C13.4632.9268 11.43 0 9 0 5.4909 0 2.4641 2.0164.9845 4.9636l2.9782 2.3319C4.6705 5.1618 6.6559 3.5795 9 3.5795z"
    />
  </svg>
)

export default function AdminLoginForm() {
  const { error, setError, clearError } = useAuthError()
  const [loading, setLoading] = useState(false)
  const isTestMode = clientEnv.TEST_MODE === "true"
  const [showLegacyLogin, setShowLegacyLogin] = useState(() => isTestMode)
  const router = useRouter()
  const searchParams = useSearchParams()
  const firebaseErrorMessage = (firebaseInitError as Error | null | undefined)?.message

  const normalizedError = error.trim()
  const alertId = "admin-auth-error"
  const hasError = normalizedError.length > 0

  const passwordResetNotice =
    searchParams.get("reset") === "1"
      ? "Your password has been updated. Please sign in."
      : null

  const finalizeLogin = useCallback(() => {
    if (typeof window !== "undefined") {
      if (
        window.opener &&
        window.opener.origin === window.location.origin
      ) {
        try {
          window.close()
          return
        } catch {
          // ignore and fallback to navigation below
        }
      }
      if (clientEnv.TEST_MODE === "true") {
        window.location.assign("/admin/dashboard")
        return
      }
      router.push("/admin/dashboard")
    }
  }, [router])

  // --- FIX: Always call hooks first, never after a conditional return ---
  useEffect(() => {
    if (firebaseInitError) {
      setError(
        firebaseErrorMessage ||
          "Firebase app failed to initialize due to misconfiguration. Please contact the site administrator."
      )
      return
    }

    let auth
    try {
      auth = getFirebaseAuth()
    } catch {
      setError(
        firebaseErrorMessage ||
          "Firebase app failed to initialize due to misconfiguration. Please contact the site administrator."
      )
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        if (await checkServerSession()) {
          finalizeLogin()
        } else {
          await signOut(auth)
        }
      }
    })
    return () => unsubscribe()
  }, [finalizeLogin, setError, firebaseErrorMessage])

  // --- Show Firebase env error, if present ---
  if (firebaseInitError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f8fd]">
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertDescription>{firebaseErrorMessage}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const handleGoogleLogin = async () => {
    clearError()
    setLoading(true)
    try {
      if (firebaseInitError) {
        setError(
          firebaseErrorMessage ||
            "Firebase app failed to initialize due to misconfiguration. Please contact the site administrator."
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
            "Firebase app failed to initialize due to misconfiguration. Please contact the site administrator."
        )
        setLoading(false)
        return
      }

      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const idToken = await result.user.getIdToken()
      // POST the ID token to the backend to set the session cookie
      const res = await fetch("/api/admin/google-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
        credentials: "include",
      })
      if (!res.ok) {
        let data: { error?: string } | undefined
        try {
          data = await res.json()
        } catch {
          // ignore JSON parsing errors
        }
        setError(
          data?.error ||
            "Authentication failed. You are not authorized to access this admin area."
        )
        setLoading(false)
        return
      }
      // Optionally check the server session after setting cookie
      if (await checkServerSession()) {
        finalizeLogin()
      } else {
        await signOut(auth)
        setError("Server session invalid. Please try logging in again.")
      }
    } catch (error: unknown) {
      safeLogError("Google sign-in error:", error)
      if (error instanceof FirebaseError) {
        if (error.code === "auth/account-exists-with-different-credential") {
          setError(
            "An account with this email already exists. Sign in with email and password, then link Google from your profile."
          )
        } else if (error.code === "auth/popup-closed-by-user") {
          setError("Google sign-in was closed before completing. Try again or use email login.")
        } else {
          setError("Authentication failed. Please try again.")
        }
      } else {
        setError("Authentication failed. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#e8f0fe] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl bg-white shadow-xl rounded-[32px] overflow-hidden md:grid md:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-6 px-8 py-10 md:px-12 md:py-16 bg-gradient-to-br from-white via-white to-[#f2f6ff] text-left">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Site logo"
              width={96}
              height={96}
              className="h-16 w-16 md:h-20 md:w-20 rounded-full object-cover border border-slate-200"
              priority
            />
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
              Welcome back
            </h1>
            <p className="text-base text-slate-600 md:text-lg">
              Create, schedule, and manage your stories.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-8 bg-white px-6 py-8 md:px-10 md:py-12 text-left">
          <div className="flex flex-col gap-6">
            {!isTestMode && (
              <Button
                type="button"
                variant="ghost"
                className="self-start px-0 text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                data-testid="legacy-login-toggle"
                aria-pressed={showLegacyLogin}
                onClick={() => {
                  clearError()
                  setShowLegacyLogin((prev) => !prev)
                }}
              >
                {showLegacyLogin
                  ? "Use modern admin login (Firebase)"
                  : "Use legacy admin password (env-based)"}
              </Button>
            )}
            {hasError && (
              <div
                id={alertId}
                role="alert"
                aria-live="assertive"
                data-testid="auth-error"
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 shadow-sm"
              >
                {normalizedError || "Authentication failed."}
              </div>
            )}
            {showLegacyLogin ? (
              <EmailLoginForm
                error={error}
                setError={setError}
                notice={passwordResetNotice ?? undefined}
                errorMessageId={hasError ? alertId : undefined}
              />
            ) : (
              <FirebaseEmailLoginForm
                error={error}
                setError={setError}
                notice={passwordResetNotice ?? undefined}
                onSuccess={finalizeLogin}
                errorMessageId={hasError ? alertId : undefined}
              />
            )}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-sm text-slate-500">Or continue with</span>
              </div>
            </div>
            <Button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full h-11 sm:h-10 border border-[#dadce0] bg-white text-[#3c4043] font-medium shadow-sm transition-[background-color,box-shadow,border-color] hover:bg-[#f7f8f8] hover:shadow focus-visible:ring-2 focus-visible:ring-[#1a73e8] focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:bg-white disabled:text-[#9aa0a6] disabled:border-[#dadce0] disabled:shadow-none disabled:opacity-100 flex items-center justify-center gap-3"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin text-[#1a73e8]" />
                  <span className="text-sm">Authenticating...</span>
                </span>
              ) : (
                <span className="flex items-center gap-3">
                  <GoogleIcon />
                  <span className="text-sm sm:text-base">Continue with Google</span>
                </span>
              )}
            </Button>
          </div>
          <div className="login-legal-bar flex min-w-0 flex-col gap-3 text-left sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-600">
              Don&apos;t have an account?{' '}
              <Link
                href="/admin/signup"
                className="font-medium text-blue-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 rounded-sm"
              >
                Sign up
              </Link>
            </p>
            <p
              className="legal-notice text-xs text-muted-foreground"
              data-testid="admin-login-legal"
            >
              By continuing you agree to our{' '}
              <Link
                href="/terms-of-service"
                className="font-medium text-blue-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 rounded-sm"
              >
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link
                href="/privacy-policy"
                className="font-medium text-blue-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 rounded-sm"
              >
                Privacy Policy
              </Link>
              . Unauthorized access is prohibited.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
