"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import useAuthError from "@/hooks/useAuthError"

export default function EmailLoginForm({ onCancel }: { onCancel: () => void }) {
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
        headers: { "Content-Type": "application/json" },
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
      {error && (
        <p className="text-red-600 text-sm" role="alert">
          {error}
        </p>
      )}

      <label htmlFor="login-email" className="sr-only">
        Email
      </label>
      <Input
        id="login-email"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <label htmlFor="login-password" className="sr-only">
        Password
      </label>
      <Input
        id="login-password"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <label htmlFor="login-otp" className="sr-only">
        2FA code (if enabled)
      </label>
      <Input
        id="login-otp"
        type="text"
        placeholder="2FA code (if enabled)"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
      />

      <Button type="submit" disabled={loading} className="w-full">
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Login
      </Button>
      <Button type="button" variant="ghost" onClick={onCancel} className="w-full">
        Back
      </Button>
    </form>
  )
}
