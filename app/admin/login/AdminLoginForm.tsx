"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
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

export default function AdminLoginForm() {
  const { error, setError, clearError } = useAuthError()
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const firebaseErrorMessage = (firebaseInitError as Error | null | undefined)?.message

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
      setError("Authentication failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-[#f5f8fd] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-sm sm:max-w-md bg-white border border-blue-100 shadow-lg rounded-2xl mx-4 relative z-10">
        <CardHeader className="space-y-2 sm:space-y-3 text-center px-4 sm:px-6 pt-6 sm:pt-8">
          <div className="space-y-2">
            <CardTitle className="text-2xl sm:text-3xl font-semibold text-slate-900">
              Welcome back
            </CardTitle>
            <CardDescription className="text-sm sm:text-base text-slate-600">
              Sign in to manage Flavor Studios operations and content.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-6 sm:pb-8">
          <div className="flex flex-col space-y-6">
            <EmailLoginForm error={error} setError={setError} />
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-slate-500">Or continue with</span>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full h-11 sm:h-10"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span className="text-sm sm:text-base">Authenticating...</span>
                </>
              ) : (
                <span className="text-sm sm:text-base">Sign in with Google</span>
              )}
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 px-4 sm:px-6 pb-6 sm:pb-8 text-center">
          <p className="text-sm text-slate-600">
            Need an account?{' '}
            <a href="/contact" className="font-medium text-blue-600 hover:underline">
              Request access
            </a>
          </p>
          <p className="text-xs text-slate-500">
            By continuing, you agree to our{' '}
            <a href="/terms-of-service" className="font-medium text-blue-600 hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy-policy" className="font-medium text-blue-600 hover:underline">
              Privacy Policy
            </a>
            .
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
