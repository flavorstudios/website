"use client"

import { useEffect } from "react"

export function Analytics() {
  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return

    try {
      // Load Google Analytics
      const gaScript = document.createElement("script")
      gaScript.src = "https://www.googletagmanager.com/gtag/js?id=G-VMSRWF3W8D"
      gaScript.async = true
      document.head.appendChild(gaScript)

      // Initialize Google Analytics
      window.dataLayer = window.dataLayer || []
      function gtag(...args: any[]) {
        window.dataLayer.push(args)
      }
      gtag("js", new Date())
      gtag("config", "G-VMSRWF3W8D")
    } catch (error) {
      console.error("Analytics error:", error)
    }
  }, [])

  return null
}
