"use client"

import { Dispatch, SetStateAction, useEffect, useState } from "react"
import type { FormEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { Label } from "@/components/ui/label"
type EmailLoginFormProps = {
  error: string
  setError: Dispatch<SetStateAction<string>>
}

export default function EmailLoginForm({ error, setError }: EmailLoginFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState(error)
  const [otpExpanded, setOtpExpanded] = useState(false)

  useEffect(() => {
    setFormError(error)
  }, [error])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setFormError("")
    try {
      const res = await fetch("/api/admin/email-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, otp }),
        credentials: "include",
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        const failureMessage = data?.error || "Authentication failed."
        if (process.env.NODE_ENV !== "production" && data?.error) {
          console.error("Email login failed:", data.error)
        }
        setError(failureMessage)
        setFormError(failureMessage)
        setLoading(false)
        return
      }
      router.push("/admin/dashboard")
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Email login network error:", error)
      }
      setError("Authentication failed.")
      setFormError("Authentication failed.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Persistent live region so SRs announce new errors */}
      <div aria-live="assertive" className="min-h-[1.5rem]">
        {formError && (
          <p id="login-error" className="text-red-600 text-sm" role="alert">
            {formError}
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
          aria-describedby={formError ? "login-error" : undefined}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="login-password">Password</Label>
          <Link
            href="/admin/login/recovery"
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
          aria-describedby={formError ? "login-error" : undefined}
        />
      </div>

      <div className="space-y-2">
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
          {otpExpanded ? "Hide 2FA code" : "Use a 2FA code"}
        </Button>
        {otpExpanded && (
          <div className="space-y-2">
            <Label htmlFor="login-otp">2FA code</Label>
            <Input
              id="login-otp"
              type="text"
              placeholder="2FA code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              aria-describedby={formError ? "login-error" : undefined}
            />
          </div>
        )}
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
        Login
      </Button>
    </form>
  )
}
