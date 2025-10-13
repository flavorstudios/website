"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, RefreshCw, CheckCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ADMIN_REFRESH } from "@/lib/admin-events"
import { logClientError } from "@/lib/log-client"

export function CacheCleaner() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [lastCleared, setLastCleared] = useState<string | null>(null)

  const clearFrontendCache = async () => {
    setLoading(true)
    try {
      // Clear service worker cache
      if ("serviceWorker" in navigator && "caches" in window) {
        const cacheNames = await caches.keys()
        await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)))
      }

      // Clear localStorage/sessionStorage for dashboard state
      const keysToRemove = Object.keys(localStorage).filter(
        (key) => key.startsWith("admin-") || key.startsWith("dashboard-") || key.startsWith("flavor-studios-"),
      )
      keysToRemove.forEach((key) => localStorage.removeItem(key))

      // Clear sessionStorage
      const sessionKeysToRemove = Object.keys(sessionStorage).filter(
        (key) => key.startsWith("admin-") || key.startsWith("dashboard-") || key.startsWith("flavor-studios-"),
      )
      sessionKeysToRemove.forEach((key) => sessionStorage.removeItem(key))

      setLastCleared(new Date().toLocaleString())
      toast("Frontend Cache Cleared")

      // Trigger data refresh
      window.dispatchEvent(new CustomEvent(ADMIN_REFRESH))
    } catch (error) {
      logClientError("Failed to clear frontend cache:", error)
      toast("Cache Clear Failed")
    } finally {
      setLoading(false)
    }
  }

  const clearBackendCache = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/cache/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timestamp: Date.now() }),
      })

      if (response.ok) {
        toast("Backend Cache Cleared")
        setLastCleared(new Date().toLocaleString())
      } else {
        throw new Error("Backend cache clear failed")
      }
    } catch (error) {
      logClientError("Failed to clear backend cache:", error)
      toast("Backend Cache Clear Failed")
    } finally {
      setLoading(false)
    }
  }

  const clearAllCaches = async () => {
    setLoading(true)
    try {
      await Promise.all([clearFrontendCache(), clearBackendCache()])

      toast("All Caches Cleared")

      // Force page refresh after clearing all caches
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      logClientError("Failed to clear all caches:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trash2 className="h-5 w-5" />
          Cache Management
        </CardTitle>
        <CardDescription>Clear cached data to ensure fresh content from Firestore</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {lastCleared && (
          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
            <CheckCircle className="h-4 w-4 text-green-700" />
            <span className="text-sm text-green-700">Last cleared: {lastCleared}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button
            onClick={clearFrontendCache}
            disabled={loading}
            className="flex flex-col items-center gap-2 h-auto p-4 rounded-xl bg-orange-700 hover:bg-orange-800 text-white"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <div className="text-center">
              <p className="font-medium">Frontend Cache</p>
              <p className="text-xs text-gray-500">Browser & Local Storage</p>
            </div>
          </Button>

          <Button
            onClick={clearBackendCache}
            disabled={loading}
            className="flex flex-col items-center gap-2 h-auto p-4 rounded-xl bg-orange-700 hover:bg-orange-800 text-white"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <div className="text-center">
              <p className="font-medium">Backend Cache</p>
              <p className="text-xs text-gray-500">Server & API Cache</p>
            </div>
          </Button>

          <Button
            onClick={clearAllCaches}
            disabled={loading}
            className="flex flex-col items-center gap-2 h-auto p-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow"
          >
            <Trash2 className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <div className="text-center">
              <p className="font-medium">Clear All</p>
              <p className="text-xs text-white">Full Cache Reset</p>
            </div>
          </Button>
        </div>

        <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
          <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium">Cache clearing will:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Force fresh data from Firestore</li>
              <li>Clear browser storage</li>
              <li>Invalidate API responses</li>
              <li>Refresh dashboard statistics</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
