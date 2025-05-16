"use server"

import { notifyIndexNow, notifyIndexNowBatch } from "@/lib/indexnow"

/**
 * Server action to notify IndexNow about a new or updated URL
 */
export async function notifyIndexNowAction(url: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await notifyIndexNow(url)

    if (!response) {
      return {
        success: false,
        message: "Failed to notify IndexNow",
      }
    }

    return {
      success: true,
      message: `Successfully notified IndexNow about: ${url}`,
    }
  } catch (error) {
    console.error("Error in IndexNow server action:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

/**
 * Server action to notify IndexNow about multiple URLs
 */
export async function notifyIndexNowBatchAction(urls: string[]): Promise<{ success: boolean; message: string }> {
  try {
    await notifyIndexNowBatch(urls)

    return {
      success: true,
      message: `Successfully notified IndexNow about ${urls.length} URLs`,
    }
  } catch (error) {
    console.error("Error in IndexNow batch server action:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}
