"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
    <div>
      <Card>
        <CardHeader>
          <CardTitle as="h2">Revalidate Entire Website</CardTitle>
          <CardDescription>
            Force a revalidation of all cached content across the entire public website. Use this after major content
            updates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleRevalidateWebsite}
            disabled={isRevalidatingWebsite}
            className="w-full sm:w-auto rounded-xl bg-orange-700 hover:bg-orange-800 text-white"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRevalidatingWebsite ? "animate-spin" : ""}`} />
            {isRevalidatingWebsite ? "Revalidating Website..." : "Revalidate Entire Website"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
