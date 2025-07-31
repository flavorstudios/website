"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const HEADING_ID = "adblock-banner-heading"

export default function AdblockBanner() {
  const [visible, setVisible] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const previousFocus = useRef<Element | null>(null)

  useEffect(() => {
    // No cookie logic: always show when detected!
    const handle = () => setVisible(true)

    if (document.body.classList.contains("adblock-detected")) {
      handle()
    } else {
      document.addEventListener("adblockDetected", handle)
      return () => document.removeEventListener("adblockDetected", handle)
    }
  }, [])

  useEffect(() => {
    if (!visible) return
    previousFocus.current = document.activeElement
    const first = modalRef.current?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    first?.focus()

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        )
        if (focusable.length === 0) return
        const firstEl = focusable[0]
        const lastEl = focusable[focusable.length - 1]
        if (e.shiftKey) {
          if (document.activeElement === firstEl) {
            e.preventDefault()
            lastEl.focus()
          }
        } else {
          if (document.activeElement === lastEl) {
            e.preventDefault()
            firstEl.focus()
          }
        }
      } else if (e.key === 'Escape') {
        dismiss()
      }
    }

    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('keydown', handleKey)
      ;(previousFocus.current as HTMLElement | null)?.focus()
    }
  }, [visible])

  // Only closes for this pageview—no cookie set!
  const dismiss = () => {
    setVisible(false)
  }

  const allowAds = () => {
    location.reload()
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={dismiss}
          />
          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={HEADING_ID}
            className="relative z-10 w-full max-w-md rounded-lg bg-white p-4 text-center shadow-xl dark:bg-slate-900 sm:p-6"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
          >
            <button
              aria-label="Dismiss"
              onClick={dismiss}
              className="absolute right-4 top-4 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-ring text-gray-500 transition hover:text-gray-700 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 id={HEADING_ID} className="mb-2 text-lg font-semibold text-gray-900 dark:text-slate-50">
              Quality content needs supporters. Will you be one?
            </h2>
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
              You currently have an AD blocker on. Ads and support help keep Flavor Studios running.
            </p>
            <div className="flex justify-center gap-4">
              <Button onClick={allowAds}>ALLOW ADS</Button>
              <Button asChild variant="secondary">
                <Link href="/support">SUBSCRIBE NOW</Link>
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
