"use client"

import { useState } from "react"
import { notifyIndexNow, notifyIndexNowBatch } from "@/lib/indexnow"

interface UseIndexNowOptions {
  onSuccess?: (url: string) => void
  onError?: (error: unknown) => void
}

/**
 * React hook for using IndexNow in client components
 */
export function useIndexNow(options: UseIndexNowOptions = {}) {
  const [isNotifying, setIsNotifying] = useState(false)
  const [error, setError] = useState<unknown>(null)

  const notify = async (url: string) => {
    setIsNotifying(true)
    setError(null)

    try {
      const response = await notifyIndexNow(url)
      if (response) {
        options.onSuccess?.(url)
      } else {
        throw new Error("Failed to notify IndexNow")
      }
      return response
    } catch (err) {
      setError(err)
      options.onError?.(err)
      return null
    } finally {
      setIsNotifying(false)
    }
  }

  const notifyBatch = async (urls: string[]) => {
    setIsNotifying(true)
    setError(null)

    try {
      await notifyIndexNowBatch(urls)
      options.onSuccess?.(urls.join(", "))
    } catch (err) {
      setError(err)
      options.onError?.(err)
    } finally {
      setIsNotifying(false)
    }
  }

  return {
    notify,
    notifyBatch,
    isNotifying,
    error,
  }
}
