"use client"
import { useEffect } from "react"

type JsonLdScriptProps = {
  jsonLd: object | null
}

/**
 * Injects a <script type="application/ld+json"> tag into <head>
 * for Google/SEO structured data.
 */
export function JsonLdScript({ jsonLd }: JsonLdScriptProps) {
  useEffect(() => {
    if (!jsonLd) return

    const script = document.createElement("script")
    script.type = "application/ld+json"
    script.innerHTML = JSON.stringify(jsonLd)
    script.setAttribute("data-injected", "jsonld") // for easy debugging

    document.head.appendChild(script)
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [jsonLd])

  return null // Component renders nothing in DOM
}
