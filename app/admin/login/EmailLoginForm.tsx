"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import useAuthError from "@/hooks/useAuthError"
export default function EmailLoginForm({ onCancel, apiKey }: { onCancel: () => void; apiKey?: string }) {
  const router = useRouter()
  const { error, setError } = useAuthError()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/admin/email-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey || "",
        },
        body: JSON.stringify({ email, password, otp }),
        credentials: "include",
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setError(data?.error || "Authentication failed.")
        setLoading(false)
        return
      }
      router.push("/admin/dashboard")
    } catch {
      setError("Authentication failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Persistent live region so SRs announce new errors */}
      <div aria-live="assertive" className="min-h-[1.5rem]">
        {error && (
          <p id="login-error" className="text-red-600 text-sm" role="alert">
            {error}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="login-email">Email</Label>
        <Input
          id="login-email"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          aria-describedby={error ? "login-error" : undefined}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="login-password">Password</Label>
        <Input
          id="login-password"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          aria-describedby={error ? "login-error" : undefined}
        />
      </div>

      <label htmlFor="login-otp" className="sr-only">
        2FA code (if enabled)
      </label>
      <Input
        id="login-otp"
        type="text"
        placeholder="2FA code (if enabled)"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        aria-describedby={error ? "login-error" : undefined}
      />

      <Button type="submit" disabled={loading} className="w-full">
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
        Sign in
      </Button>
      <Button type="button" variant="ghost" onClick={onCancel} className="w-full">
        Back
      </Button>
    </form>
  )
}
