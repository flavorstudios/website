"use client"
import { useEffect, useState } from "react"
import { Download, X } from "lucide-react"

export default function InstallPWAButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null)
  const [showButton, setShowButton] = useState(false)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    // Only show if not dismissed
    if (typeof window !== "undefined" && sessionStorage.getItem("fs-hide-pwa") === "1") {
      setHidden(true)
      return
    }
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowButton(true)
    }
    window.addEventListener("beforeinstallprompt", handler)

    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt && "prompt" in deferredPrompt) {
      // @ts-ignore
      ;(deferredPrompt as any).prompt()
      // @ts-ignore
      const choiceResult = await (deferredPrompt as any).userChoice
      if (choiceResult.outcome === "accepted") {
        setShowButton(false)
      }
    }
  }

  const handleClose = () => {
    setShowButton(false)
    setHidden(true)
    if (typeof window !== "undefined") sessionStorage.setItem("fs-hide-pwa", "1")
  }

  // ** Show only on desktop or mobile? **
  // Uncomment the following to show only on desktop
  // useEffect(() => {
  //   if (typeof window !== "undefined" && window.innerWidth < 768) {
  //     setShowButton(false);
  //   }
  // }, []);

  if (!showButton || hidden) return null

  return (
    <div
      className="fixed bottom-4 right-4 z-50 animate-fade-in"
      style={{
        animation: "fadein 0.7s",
      }}
    >
      <div
        className="flex items-center bg-gradient-to-r from-pink-500 via-indigo-600 to-purple-600 shadow-lg border border-white/10 rounded-xl px-5 py-2.5 gap-2 text-white backdrop-blur-xl"
        style={{
          boxShadow: "0 8px 32px rgba(130, 71, 229, 0.2), 0 2px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Download className="w-5 h-5 text-white/90" />
        <span className="mr-2 font-medium text-sm">Install Flavor Studios App</span>
        <button
          onClick={handleInstall}
          className="px-4 py-1.5 bg-white text-indigo-600 rounded-lg hover:bg-white/90 transition text-sm font-semibold"
        >
          Install
        </button>
        <button
          onClick={handleClose}
          className="ml-1 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <style jsx global>{`
        @keyframes fadein {
          from { opacity: 0; transform: translateY(20px);}
          to { opacity: 1; transform: translateY(0);}
        }
      `}</style>
    </div>
  )
}
