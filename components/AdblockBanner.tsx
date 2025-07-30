"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const COOKIE_NAME = "adblockBannerDismissed"
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 // 7 days in seconds

function getCookie(name: string) {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"))
  return match ? match[2] : null
}

function setCookie(name: string, value: string, maxAge: number) {
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}`
}

export default function AdblockBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (getCookie(COOKIE_NAME)) return

    const handle = () => setVisible(true)

    if (document.body.classList.contains("adblock-detected")) {
      handle()
    } else {
      document.addEventListener("adblockDetected", handle)
      return () => document.removeEventListener("adblockDetected", handle)
    }
  }, [])

  const dismiss = () => {
    setCookie(COOKIE_NAME, "true", COOKIE_MAX_AGE)
    setVisible(false)
  }

  const allowAds = () => {
    setCookie(COOKIE_NAME, "true", COOKIE_MAX_AGE)
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
            className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 text-center shadow-xl dark:bg-slate-900"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
          >
            <button
              aria-label="Dismiss"
              onClick={dismiss}
              className="absolute right-4 top-4 text-gray-500 transition hover:text-gray-700 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="mb-2 text-lg font-semibold">
              Quality content needs supporters. Will you be one?
            </h2>
            <p className="mb-4 text-sm text-muted-foreground">
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
