"use client"
import { useEffect } from "react"

export function JsonLdScript({ jsonLd }: { jsonLd: object }) {
  useEffect(() => {
    const script = document.createElement("script")
    script.type = "application/ld+json"
    script.innerHTML = JSON.stringify(jsonLd)
    document.head.appendChild(script)
    return () => {
      document.head.removeChild(script)
    }
  }, [jsonLd])
  return null // This component only injects the script
}
