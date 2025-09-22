"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import EmailLoginForm from "./EmailLoginForm"
import FirebaseEmailLoginForm from "./FirebaseEmailLoginForm"
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
    width="20"
    height="20"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4 text-slate-900"
  >
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <text
      x="12"
      y="12"
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize="11"
      fontFamily="'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif"
      fontWeight="600"
      fill="currentColor"
    >
      G
    </text>
  </svg>
)

export default function AdminLoginForm() {
  const { error, setError, clearError } = useAuthError()
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const firebaseErrorMessage = (firebaseInitError as Error | null | undefined)?.message

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
      router.push("/admin/dashboard")
    }
  }, [router])

  // --- FIX: Always call hooks first, never after a conditional return ---
  useEffect(() => {
    setMounted(true)

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

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-[#e8f0fe] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl bg-white shadow-xl rounded-[32px] overflow-hidden md:grid md:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-6 px-8 py-10 md:px-12 md:py-16 bg-gradient-to-br from-white via-white to-[#f2f6ff] text-left">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Site logo"
              width={64}
              height={64}
              className="h-10 w-auto"
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
            <div className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold text-slate-900">Sign in with email</h2>
                <p className="text-sm text-slate-600">
                  Use the credentials you created during admin signup. This uses Firebase Authentication and keeps your session in sync across devices.
                </p>
              </div>
              <FirebaseEmailLoginForm
                error={error}
                setError={setError}
                notice={passwordResetNotice ?? undefined}
                onSuccess={finalizeLogin}
              />
            </div>
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
              className="w-full h-11 sm:h-10 bg-white border border-slate-300 text-slate-900 font-medium transition-colors hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span className="text-sm">Authenticating...</span>
                </>
              ) : (
                <>
                  <GoogleIcon />
                  <span className="text-sm sm:text-base">Continue with Google</span>
                </>
              )}
            </Button>
            <details className="rounded-md border border-slate-200 bg-slate-50/80 p-4">
              <summary
                className="cursor-pointer text-sm font-semibold text-slate-700"
                data-testid="legacy-login-toggle"
              >
                Use legacy admin password (env-based)
              </summary>
              <div className="mt-3 space-y-3 text-sm text-slate-600">
                <p>
                  This fallback relies on <code>ADMIN_PASSWORD_HASH</code> and <code>ADMIN_JWT_SECRET</code>. Use it only if you are still migrating accounts.
                </p>
                <EmailLoginForm
                  error={error}
                  setError={setError}
                  notice={passwordResetNotice ?? undefined}
                />
              </div>
            </details>
          </div>
        <div className="flex flex-col gap-3 text-left">
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
              className="text-xs text-slate-500"
              data-testid="admin-login-legal"
            >
              By continuing, you agree to our{' '}
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
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
