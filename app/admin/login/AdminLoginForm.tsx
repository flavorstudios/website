"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Loader2, Sparkles } from "lucide-react"
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
      headers: { "api-key": clientEnv.NEXT_PUBLIC_API_KEY || "" },
    })
  ).ok

export default function AdminLoginForm() {
  const { error, setError, clearError } = useAuthError()
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [method, setMethod] = useState<"google" | "email">("email")
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
    setError("")
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
          "api-key": clientEnv.NEXT_PUBLIC_API_KEY || "",
        },
        body: JSON.stringify({ idToken }),
        credentials: "include",
      })
      if (!res.ok) {
        setError("Authentication failed. You are not authorized to access this admin area.")
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
        <CardHeader className="space-y-3 sm:space-y-4 text-center px-4 sm:px-6 pt-6 sm:pt-8">
          <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
            <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
          </div>
          <div className="space-y-1 sm:space-y-2">
            <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
              Flavor Studios Admin
            </CardTitle>
            <CardDescription className="text-sm sm:text-base text-gray-600 px-2">
              Access your creative command center
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-6 sm:pb-8">
          <div className="flex flex-col space-y-4 sm:space-y-6">
            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700 text-sm">{error}</AlertDescription>
              </Alert>
            )}
            {method === "google" ? (
              <>
                <Button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full min-h-[48px] h-12 sm:h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow transition-all duration-200 text-base sm:text-sm"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span className="text-sm sm:text-base">Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      <span className="text-sm sm:text-base">Sign in with Google</span>
                    </>
                  )}
                </Button>
                <Button variant="ghost" onClick={() => { clearError(); setMethod("email") }} className="w-full">
                  Use Email &amp; Password
                </Button>
                <div className="mt-4 sm:mt-6 text-center">
                  <p className="text-xs text-gray-500 px-2">Secured with enterprise-grade encryption</p>
                </div>
              </>
            ) : (
              <EmailLoginForm onCancel={() => { clearError(); setMethod("google") }} />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
