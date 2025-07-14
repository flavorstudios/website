"use client"
import { useState } from "react"
import { getMessaging, getToken, isSupported } from "firebase/messaging"
import app from "@/lib/firebase"

export default function EnableNotificationsButton() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState("")

  const handleEnableNotifications = async () => {
    setLoading(true)
    setResult("")
    try {
      // Check browser support for notifications and service worker
      const supported = await isSupported()
      if (!supported || !("serviceWorker" in navigator)) {
        setResult("Notifications are not supported in this browser.")
        return
      }

      // Validate VAPID key presence before requesting token
      const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
      if (!vapidKey) {
        setResult(
          "Push notifications cannot be enabled: The VAPID key is missing from the environment configuration. Please contact the site administrator."
        )
        return
      }

      // Register the unified service worker (handles PWA & push)
      const swReg = await navigator.serviceWorker.register("/sw.js")
      const messaging = getMessaging(app)

      // Request permission and get FCM token
      const token = await getToken(messaging, {
        vapidKey,
        serviceWorkerRegistration: swReg,
      })
      if (token) {
        // Send the token to your backend for storage
        await fetch("/api/notifications/register-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        })
        setResult("Push enabled! Token stored for notifications.")
      } else {
        setResult("Permission granted, but no token returned.")
      }
    } catch (err: any) {
      setResult("Failed: " + (err?.message || "Unknown error"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="my-8 flex flex-col items-center">
      <button
        onClick={handleEnableNotifications}
        disabled={loading}
        className="px-6 py-3 rounded bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold shadow hover:from-purple-700 hover:to-blue-700 transition"
      >
        {loading ? "Enabling..." : "Enable Push Notifications"}
      </button>
      {result && (
        <div className="mt-4 p-3 bg-gray-100 rounded border text-sm text-gray-700 max-w-lg break-all">
          {result}
        </div>
      )}
    </div>
  )
}
