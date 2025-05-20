"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"

export function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false)

  useEffect(() => {
    // Check if user has already given consent
    const hasConsent = localStorage.getItem("cookie-consent")

    // Only show banner if no consent has been given
    if (!hasConsent) {
      // Slight delay to prevent hydration issues
      const timer = setTimeout(() => {
        setShowConsent(true)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [])

  const acceptAll = () => {
    localStorage.setItem("cookie-consent", "accepted")
    setShowConsent(false)

    // Enable analytics if needed
    if (typeof window.gtag === "function") {
      window.gtag("consent", "update", {
        analytics_storage: "granted",
        ad_storage: "granted",
      })
    }
  }

  const rejectAll = () => {
    localStorage.setItem("cookie-consent", "rejected")
    setShowConsent(false)

    // Disable analytics if needed
    if (typeof window.gtag === "function") {
      window.gtag("consent", "update", {
        analytics_storage: "denied",
        ad_storage: "denied",
      })
    }
  }

  if (!showConsent) return null

  return (
    <div className="fixed bottom-4 left-0 right-0 z-50 mx-auto max-w-md px-4">
      <div className="rounded-lg border border-primary/10 bg-background/95 p-4 shadow-lg backdrop-blur">
        <div className="flex items-start justify-between">
          <h3 className="font-orbitron text-lg font-semibold">Cookie Consent</h3>
          <button onClick={rejectAll} className="ml-4 rounded-full p-1 text-muted-foreground hover:bg-muted">
            <X size={16} />
            <span className="sr-only">Close</span>
          </button>
        </div>

        <p className="mt-2 text-sm text-muted-foreground">
          We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our
          traffic. By clicking "Accept All", you consent to our use of cookies.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={acceptAll}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Accept All
          </button>
          <button
            onClick={rejectAll}
            className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            Reject All
          </button>
        </div>
      </div>
    </div>
  )
}
