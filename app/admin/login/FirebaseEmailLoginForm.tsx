"use client"

import { useEffect, useState, type FormEvent } from "react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { clientEnv } from "@/env.client"
import { getFirebaseAuth } from "@/lib/firebase"
import {
  signInWithEmailAndPassword,
  signOut,
  type UserCredential,
} from "firebase/auth"
import { FirebaseError } from "firebase/app"

type FirebaseEmailLoginFormProps = {
  error: string
  notice?: string
  setError: (value: string) => void
  onSuccess: () => void
}

const requiresVerification =
  clientEnv.NEXT_PUBLIC_REQUIRE_ADMIN_EMAIL_VERIFICATION === "true"
const isTestMode = clientEnv.TEST_MODE === "true"

const getFriendlyErrorMessage = (error: unknown): string => {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "auth/invalid-credential":
      case "auth/wrong-password":
      case "auth/user-not-found":
        return "Incorrect email or password."
      case "auth/too-many-requests":
        return "Too many attempts. Reset your password or try again later."
      case "auth/user-disabled":
        return "This account has been disabled. Contact your administrator."
      case "auth/invalid-email":
        return "Enter a valid email address."
      default:
        break
    }
  }
  return "Authentication failed."
}

export default function FirebaseEmailLoginForm({
  error,
  notice,
  onSuccess,
  setError,
}: FirebaseEmailLoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState(error)
  const [infoNotice, setInfoNotice] = useState<string | null>(notice ?? null)

  useEffect(() => {
    setFormError(error)
  }, [error])

  useEffect(() => {
    setInfoNotice(notice ?? null)
  }, [notice])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError("")
    setFormError("")
    setInfoNotice(null)

    try {
      if (isTestMode) {
        const response = await fetch("/api/admin/email-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        })

        if (!response.ok) {
          const data = await response.json().catch(() => null)
          const message =
            (typeof data?.error === "string" && data.error.length > 0
              ? data.error
              : "Authentication failed.")
          setError(message)
          setFormError(message)
          setLoading(false)
          return
        }

        onSuccess()
        return
      }

      let credential: UserCredential | null = null
      let idToken = ""

      const auth = getFirebaseAuth()
      credential = await signInWithEmailAndPassword(auth, email, password)

      if (requiresVerification && !credential.user.emailVerified) {
        await signOut(auth)
        const message = "Verify your email before signing in."
        setError(message)
        setFormError(message)
        setLoading(false)
        return
      }

      idToken = await credential.user.getIdToken()

      const response = await fetch("/api/admin/email-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ idToken }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        const message =
          (typeof data?.error === "string" && data.error.length > 0
            ? data.error
            : "Authentication failed.")
        await credential?.user?.reload().catch(() => undefined)
        setError(message)
        setFormError(message)
        setLoading(false)
        return
      }

      onSuccess()
    } catch (err: unknown) {
      if (clientEnv.NODE_ENV !== "production") {
        console.error("Firebase email sign-in failed", err)
      }
      const message = getFriendlyErrorMessage(err)
      setError(message)
      setFormError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="min-h-[1.5rem] space-y-2" aria-live="assertive">
        {formError && (
          <p id="firebase-login-error" className="text-sm text-red-600" role="alert">
            {formError}
          </p>
        )}
        {infoNotice && (
          <p className="text-sm text-slate-600" role="status" aria-live="polite">
            {infoNotice}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="firebase-login-email">Email</Label>
        <Input
          id="firebase-login-email"
          type="email"
          value={email}
          autoComplete="email"
          placeholder="you@example.com"
          onChange={(event) => {
            setEmail(event.target.value)
            if (formError) {
              setFormError("")
              setError("")
            }
          }}
          required
          aria-describedby={formError ? "firebase-login-error" : undefined}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="firebase-login-password">Password</Label>
        <Input
          id="firebase-login-password"
          type="password"
          value={password}
          autoComplete="current-password"
          placeholder="Password"
          onChange={(event) => {
            setPassword(event.target.value)
            if (formError) {
              setFormError("")
              setError("")
            }
          }}
          required
          aria-describedby={formError ? "firebase-login-error" : undefined}
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading} aria-busy={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
        {loading ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  )
}