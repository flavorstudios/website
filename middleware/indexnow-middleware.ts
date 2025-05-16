import { type NextRequest, NextResponse } from "next/server"
import { notifyIndexNow } from "@/lib/indexnow"

// Content paths that should trigger IndexNow notifications
const CONTENT_PATHS = ["/blog/", "/watch/", "/play/", "/about", "/contact", "/support", "/career"]

// Cache to prevent duplicate notifications
const notifiedUrls = new Set<string>()

/**
 * Middleware to automatically notify IndexNow when content changes
 * This can be used in API routes or server actions that update content
 */
export async function handleIndexNowNotification(req: NextRequest, contentPath: string): Promise<void> {
  // Skip if not a content path we care about
  if (!CONTENT_PATHS.some((path) => contentPath.includes(path))) {
    return
  }

  // Skip if we've already notified for this URL recently
  if (notifiedUrls.has(contentPath)) {
    return
  }

  // Add to cache to prevent duplicate notifications
  notifiedUrls.add(contentPath)

  // Clean up cache after 1 hour
  setTimeout(
    () => {
      notifiedUrls.delete(contentPath)
    },
    60 * 60 * 1000,
  )

  // Notify IndexNow
  await notifyIndexNow(contentPath)
}

/**
 * Example of how to use the middleware in a route handler
 */
export async function POST(req: NextRequest) {
  // Process the request...

  // Get the content path from the request
  const { contentPath } = await req.json()

  // Notify IndexNow if needed
  await handleIndexNowNotification(req, contentPath)

  // Return the response
  return NextResponse.json({ success: true })
}
