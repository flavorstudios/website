"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useIndexNow } from "@/hooks/use-indexnow"
import { notifyIndexNowAction } from "@/app/actions/indexnow-actions"

interface IndexNowNotifierProps {
  url?: string
  label?: string
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
  useServerAction?: boolean
  onSuccess?: (url: string) => void
  onError?: (error: unknown) => void
  className?: string
}

/**
 * Component that provides a button to manually trigger IndexNow notifications
 */
export function IndexNowNotifier({
  url = window.location.pathname,
  label = "Notify Search Engines",
  variant = "outline",
  size = "sm",
  useServerAction = false,
  onSuccess,
  onError,
  className,
}: IndexNowNotifierProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState<string>("")

  const { notify, isNotifying } = useIndexNow({
    onSuccess: (notifiedUrl) => {
      setStatus("success")
      setMessage(`Successfully notified search engines about: ${notifiedUrl}`)
      onSuccess?.(notifiedUrl)
      setTimeout(() => setStatus("idle"), 3000)
    },
    onError: (err) => {
      setStatus("error")
      setMessage(err instanceof Error ? err.message : "Failed to notify search engines")
      onError?.(err)
      setTimeout(() => setStatus("idle"), 3000)
    },
  })

  const handleClick = async () => {
    setStatus("loading")

    if (useServerAction) {
      try {
        const result = await notifyIndexNowAction(url)

        if (result.success) {
          setStatus("success")
          setMessage(result.message)
          onSuccess?.(url)
        } else {
          setStatus("error")
          setMessage(result.message)
          onError?.(new Error(result.message))
        }

        setTimeout(() => setStatus("idle"), 3000)
      } catch (error) {
        setStatus("error")
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
        setMessage(errorMessage)
        onError?.(error)
        setTimeout(() => setStatus("idle"), 3000)
      }
    } else {
      await notify(url)
    }
  }

  return (
    <div className={className}>
      <Button variant={variant} size={size} onClick={handleClick} disabled={status === "loading" || isNotifying}>
        {status === "loading" || isNotifying ? "Notifying..." : label}
      </Button>

      {status === "success" && <p className="text-sm text-green-500 mt-2">{message}</p>}

      {status === "error" && <p className="text-sm text-red-500 mt-2">{message}</p>}
    </div>
  )
}
