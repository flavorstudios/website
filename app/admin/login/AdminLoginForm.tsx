"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Loader2, Sparkles } from "lucide-react"

// --- Firebase Auth ---
import { GoogleAuthProvider, signInWithPopup, getAuth, onAuthStateChanged, User } from "firebase/auth"
import app from "@/lib/firebase"

// Safe client-side error logger (does nothing in prod, only logs in dev)
function safeLogError(...args: any[]) {
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.error(...args)
  }
}

export default function AdminLoginForm() {
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  // Check if already logged in
  useEffect(() => {
    setMounted(true)
    const auth = getAuth(app)
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        router.push("/admin/dashboard")
      }
    })
    return () => unsubscribe()
  }, [router])

  const handleGoogleLogin = async () => {
    setError("")
    setLoading(true)
    try {
      const auth = getAuth(app)
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const idToken = await result.user.getIdToken()
      // POST the ID token to the backend to set the session cookie
      const res = await fetch("/api/admin/google-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      })
      if (!res.ok) {
        setError("Authentication failed. You are not authorized to access this admin area.")
        setLoading(false)
        return
      }
      router.push("/admin/dashboard")
    } catch (error: any) {
      // Codex: never log sensitive errors in production
      safeLogError("Google sign-in error:", error)
      setError("Authentication failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 sm:-top-40 sm:-right-40 w-40 h-40 sm:w-80 sm:h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 sm:-bottom-40 sm:-left-40 w-40 h-40 sm:w-80 sm:h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 sm:w-80 sm:h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
      </div>

      <Card className="w-full max-w-sm sm:max-w-md relative z-10 backdrop-blur-sm bg-white/95 border-0 shadow-2xl mx-4">
        <CardHeader className="space-y-3 sm:space-y-4 text-center px-4 sm:px-6 pt-6 sm:pt-8">
          <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center">
            <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <div className="space-y-1 sm:space-y-2">
            <CardTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent leading-tight">
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
            <Button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full min-h-[48px] h-12 sm:h-11 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] text-base sm:text-sm"
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
            <div className="mt-4 sm:mt-6 text-center">
              <p className="text-xs text-gray-500 px-2">Secured with enterprise-grade encryption</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
