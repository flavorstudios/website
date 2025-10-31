"use client"

import { useEffect } from "react"
import { logClientError } from "@/lib/log-client"

export default function SettingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    logClientError("admin-settings:route-error", error)
  }, [error])

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-6">
      <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-6 text-destructive">
        <p className="font-semibold">Unable to render admin settings.</p>
        <p className="mt-2 text-sm opacity-80">
          {error.message || "An unexpected error occurred while loading this page."}
        </p>
        {error.digest ? (
          <p className="mt-2 text-xs opacity-60">Error reference: {error.digest}</p>
        ) : null}
        <button
          type="button"
          onClick={reset}
          className="mt-4 inline-flex rounded bg-destructive px-3 py-1 text-sm font-medium text-destructive-foreground"
        >
          Try again
        </button>
      </div>
    </div>
  )
}