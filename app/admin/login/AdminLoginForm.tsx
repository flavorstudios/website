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
    width="18"
    height="18"
    viewBox="0 0 18 18"
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
  >
    <path
      d="M17.64 9.2045c0-.638-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2091 1.125-.8436 2.0782-1.7968 2.7164v2.2581h2.9086c1.7018-1.5673 2.6846-3.8764 2.6846-6.6149z"
      fill="#4285F4"
    />
    <path
      d="M9 18c2.43 0 4.4673-.8059 5.9563-2.1805l-2.9086-2.2581c-.8059.54-1.8368.8591-3.0477.8591-2.3441 0-4.3282-1.5832-5.0368-3.7104H.95697v2.3318C2.43786 15.9832 5.48182 18 9 18z"
      fill="#34A853"
    />
    <path
      d="M3.96318 10.7101C3.78409 10.1705 3.68182 9.59322 3.68182 9c0-.59323.10227-1.17045.28136-1.71005V4.95818H.95697C.347727 6.17341 0 7.54364 0 9c0 1.4564.347727 2.8266.95697 4.0418l3.00621-2.3317z"
      fill="#FBBC05"
    />
    <path
      d="M9 3.54545c1.3214 0 2.5064.4541 3.4378 1.34637l2.5782-2.57819C13.464 1.01727 11.4273 0 9 0 5.48182 0 2.43786 2.01682.95697 4.95818L3.96318 7.28996C4.67182 5.16273 6.65591 3.54545 9 3.54545z"
      fill="#EA4335"
    />
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
              Create, schedule, and manage your stories with the admin tools you know.
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
              className="w-full h-11 sm:h-10 bg-white border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 focus-visible:ring-slate-200 flex items-center justify-center gap-2"
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
