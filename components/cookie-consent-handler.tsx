"use client"

import { useEffect } from "react"

export function CookieConsentHandler() {
  useEffect(() => {
    // Simple function to hide the revisit button using CSS
    const hideRevisitButton = () => {
      // Create a style element if it doesn't exist
      if (!document.getElementById("cky-style-override")) {
        const style = document.createElement("style")
        style.id = "cky-style-override"
        style.innerHTML = `
          .cky-revisit-bottom-left, 
          .cky-revisit-bottom-right, 
          .cky-revisit-top-left, 
          .cky-revisit-top-right {
            display: none !important;
          }
        `
        document.head.appendChild(style)
      }
    }

    // Add the style immediately and also after a delay to ensure it applies
    hideRevisitButton()

    // Also apply after a short delay to ensure the CookieYes elements have loaded
    const timeoutId = setTimeout(hideRevisitButton, 2000)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [])

  return null
}
