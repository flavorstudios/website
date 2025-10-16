"use client"

import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { revalidateEntireWebsite } from "@/app/admin/actions/system"
import { logClientError } from "@/lib/log-client"

export default function SystemTools() {
  const { toast } = useToast()
  const [isRevalidatingWebsite, setIsRevalidatingWebsite] = useState(false)

  const handleRevalidateWebsite = async () => {
    setIsRevalidatingWebsite(true)
    try {
      const result = await revalidateEntireWebsite()
      toast(result.message)
    } catch (error) {
      logClientError("Failed to revalidate website:", error)
      toast("Failed to revalidate entire website.")
    } finally {
      setIsRevalidatingWebsite(false)
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground">Revalidate Entire Website</h2>
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Force a revalidation of all cached content across the entire public website.
        </p>
        <Button
          onClick={handleRevalidateWebsite}
          disabled={isRevalidatingWebsite}
          className="w-full rounded-lg bg-orange-600 px-6 py-3 text-white transition-colors hover:bg-orange-700 sm:w-auto"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRevalidatingWebsite ? "animate-spin" : ""}`} />
          {isRevalidatingWebsite ? "Revalidating Website..." : "Revalidate Entire Website"}
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">Use this after major content updates.</p>
    </div>
  )
}
