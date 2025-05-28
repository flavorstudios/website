"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"

export function NewsletterSignup() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus("idle")

    try {
      // This is a placeholder for actual API call
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setSubmitStatus("success")
      setEmail("")
    } catch (error) {
      setSubmitStatus("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
      <Input
        type="email"
        placeholder="Enter your email address"
        className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-blue-200 focus:bg-white/20"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={isSubmitting}
        aria-label="Email address"
      />
      <Button
        type="submit"
        className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Subscribing...
          </>
        ) : (
          "Subscribe"
        )}
      </Button>

      {submitStatus === "success" && (
        <div className="absolute mt-12 sm:mt-14 text-sm text-green-300 bg-green-900/30 px-3 py-1 rounded">
          Thank you for subscribing!
        </div>
      )}

      {submitStatus === "error" && (
        <div className="absolute mt-12 sm:mt-14 text-sm text-red-300 bg-red-900/30 px-3 py-1 rounded">
          Something went wrong. Please try again.
        </div>
      )}
    </form>
  )
}
