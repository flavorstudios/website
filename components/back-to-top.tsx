"use client"

import { useState, useEffect } from "react"
import { ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener("scroll", toggleVisibility)
    return () => window.removeEventListener("scroll", toggleVisibility)
  }, [])

  const scrollToTop = () => {
    // Add haptic feedback for mobile devices
    if ("vibrate" in navigator) {
      navigator.vibrate(50)
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  return (
    <Button
      variant="outline"
      size="icon"
      className={`fixed bottom-8 right-8 z-50 h-12 w-12 bg-white/80 hover:bg-white/100 text-slate-800 backdrop-blur transition-all duration-300 shadow-lg rounded-full ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
      }`}
      onClick={scrollToTop}
      aria-label="Back to top"
    >
      <ArrowUp className="h-5 w-5" />
    </Button>
  )
}
