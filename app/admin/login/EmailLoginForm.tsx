"use client"

import { Dispatch, SetStateAction, useEffect, useState } from "react"
import type { FormEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import useSWR from "swr"
type EmailLoginFormProps = {
  error: string
  setError: Dispatch<SetStateAction<string>>
  notice?: string
  errorMessageId?: string
}

const fetchMfaStatus = async (url: string): Promise<{ mfaRequired: boolean }> => {
  const res = await fetch(url, { credentials: "include" })
  if (!res.ok) {
    return { mfaRequired: false }
  }
  const data = (await res.json()) as { mfaRequired: boolean }
  return data
}

export default function EmailLoginForm({
  error,
  setError,
  notice,
  errorMessageId,
}: EmailLoginFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(error || null)
  const [hasLocalFormError, setHasLocalFormError] = useState(false)
  const [otpExpanded, setOtpExpanded] = useState(false)
  const [infoNotice, setInfoNotice] = useState<string | null>(notice ?? null)
  const { data: mfaStatus } = useSWR<{ mfaRequired: boolean }>(
    "/api/admin/email-session",
    fetchMfaStatus,
    {
      revalidateOnFocus: false,
    }
  )
  const mfaRequired = mfaStatus?.mfaRequired ?? false

  useEffect(() => {
    if (error) {
      setFormError((prev) => (prev === error ? prev : error))
      if (hasLocalFormError && formError !== error) {
        setHasLocalFormError(false)
      }
      return
    }

    if (!hasLocalFormError) {
      setFormError((prev) => (prev === null ? prev : null))
    }
  }, [error, formError, hasLocalFormError])

  useEffect(() => {
    setInfoNotice(notice ?? null)
  }, [notice])

  useEffect(() => {
    if (mfaRequired) {
      setOtpExpanded(true)
    }
  }, [mfaRequired])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setHasLocalFormError(false)
    setFormError(null)
    try {
      const hasOtp = Boolean(otp)
      const endpoint = hasOtp ? "/api/admin/email-session" : "/api/admin/email-login"

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          ...(hasOtp ? { otp } : {}),
        }),
        credentials: "include",
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { error?: string }
          | null
        const failureMessage = "Authentication failed."
        if (process.env.NODE_ENV !== "production" && data?.error) {
          console.error("Email login failed:", data.error)
        }
        setError(failureMessage)
        setHasLocalFormError(true)
        setFormError(failureMessage)
        setLoading(false)
        return
      }
      router.push("/admin/dashboard")
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Email login network error:", error)
      }
      const failureMessage = "Authentication failed."
      setError(failureMessage)
      setHasLocalFormError(true)
      setFormError(failureMessage)
    } finally {
      setLoading(false)
    }
  }

  const isOtpFlow = mfaRequired || otpExpanded || otp.length > 0;

  const errorRegionId = errorMessageId ?? "login-error"
  const describedBy = formError ? errorRegionId : undefined

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Persistent live region so SRs announce new errors */}
      <div className="min-h-[1.5rem] space-y-2">
        {formError && (
          <div
            id={errorRegionId}
            role="alert"
            aria-live="assertive"
            className="text-sm text-red-600"
          >
            {formError}
          </div>
        )}
        {infoNotice && (
          <p
            className="text-sm text-slate-600"
            role="status"
            aria-live="polite"
          >
            {infoNotice}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="login-email">Email</Label>
        <Input
          id="login-email"
          type="email"
          placeholder="m@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          aria-describedby={describedBy}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="login-password">Password</Label>
          <Link
            href="/admin/forgot-password"
            className="text-sm font-medium text-primary hover:underline"
          >
            Forgot your password?
          </Link>
        </div>
        <Input
          id="login-password"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          aria-describedby={describedBy}
        />
      </div>

      {mfaRequired && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="link"
              className="h-auto px-0 text-sm font-medium"
              aria-expanded={otpExpanded}
              aria-controls="login-otp"
              onClick={() => {
                setOtpExpanded((prev) => {
                  const next = !prev
                  if (!next) {
                    setOtp("")
                  }
                  return next
                })
              }}
            >
              {otpExpanded ? "Hide verification code" : "Use a verification code"}
            </Button>
            <Link
              href="/admin/login/recovery"
              className="text-sm font-medium text-primary hover:underline"
            >
              Having trouble?
            </Link>
          </div>
          {otpExpanded && (
            <div className="space-y-2">
              <Label htmlFor="login-otp">Verification code</Label>
              <Input
                id="login-otp"
                type="text"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                aria-describedby={formError ? "login-error" : undefined}
                required={mfaRequired}
              />
            </div>
          )}
        </div>
      )}

      <Button
        type="submit"
        disabled={loading}
        aria-busy={loading}
        variant="brand"
        size="prominent"
        className="w-full"
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
        {loading
          ? isOtpFlow
            ? "Logging in…"
            : "Signing in…"
          : isOtpFlow
            ? "Login"
            : "Sign in"}
      </Button>
    </form>
  )
}
