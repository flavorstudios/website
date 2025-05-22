"use client"

import { useEffect } from "react"
import Script from "next/script"

export function CookieYesLoader() {
  useEffect(() => {
    // Store the original createElement method
    const originalCreateElement = document.createElement.bind(document)

    // Counter to track script elements created in a short time
    let scriptCreateCount = 0
    const maxScriptCreateCount = 10 // Threshold for detecting potential infinite recursion
    let lastResetTime = Date.now()

    // Monkey patch document.createElement
    document.createElement = (tagName: string, options?: ElementCreationOptions) => {
      if (tagName.toLowerCase() === "script") {
        // Reset counter if enough time has passed
        const now = Date.now()
        if (now - lastResetTime > 1000) {
          scriptCreateCount = 0
          lastResetTime = now
        }

        scriptCreateCount++

        // If too many scripts are created in a short time, it might be an infinite recursion
        if (scriptCreateCount > maxScriptCreateCount) {
          console.warn("CookieYes: Prevented potential infinite script creation")
          // Return a dummy script element that won't execute
          const dummyScript = originalCreateElement("script")
          // Make the dummy script inert
          Object.defineProperty(dummyScript, "src", {
            set: () => {
              /* no-op */
            },
            get: () => "",
          })
          return dummyScript
        }
      }

      // Call the original method for normal operation
      return originalCreateElement(tagName, options)
    }

    return () => {
      // Restore original method when component unmounts
      document.createElement = originalCreateElement
    }
  }, [])

  return (
    <Script
      id="cookieyes"
      src="https://cdn-cookieyes.com/client_data/a5532f07a3a3cb960fbc8715/script.js"
      strategy="lazyOnload"
      onError={(e) => {
        console.error("Error loading CookieYes script:", e)
      }}
    />
  )
}
