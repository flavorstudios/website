"use client"

import { useState, useEffect, useRef } from "react"
import { ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false)
  const [isScrolling, setIsScrolling] = useState(false)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      const shouldShow = window.scrollY > 300

      // Show/hide based on scroll position
      setIsVisible(shouldShow)

      if (shouldShow) {
        // User is scrolling - show button immediately
        setIsScrolling(true)

        // Clear existing timeout
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current)
        }

        // Set new timeout to hide after 2 seconds of no scrolling
        scrollTimeoutRef.current = setTimeout(() => {
          setIsScrolling(false)
        }, 2000)
      }
    }

    window.addEventListener("scroll", handleScroll)

    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
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

  // Button is visible when: user has scrolled down AND (is currently scrolling OR within 2 seconds of last scroll)
  const shouldShowButton = isVisible && isScrolling

  return (
    <Button
      variant="outline"
      size="icon"
      className={`fixed bottom-8 right-8 z-50 h-12 w-12 bg-white/80 hover:bg-white/100 text-slate-800 backdrop-blur transition-all duration-300 shadow-lg rounded-full ${
        shouldShowButton ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
      }`}
      onClick={scrollToTop}
      aria-label="Back to top"
    >
      <ArrowUp className="h-5 w-5" />
    </Button>
  )
}
