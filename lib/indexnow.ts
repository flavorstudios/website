/**
 * IndexNow utility for notifying search engines about new or updated content
 * @see https://www.indexnow.org/documentation
 */

const INDEXNOW_KEY = "d3182b75d1db459e952a78f896afd842"
const SITE_URL = "https://flavorstudios.in"

/**
 * Notifies search engines about a new or updated URL via IndexNow
 * @param url The full or relative URL of the page that was created or updated
 * @param keyLocation Optional custom location of the key file (defaults to root)
 * @returns Promise that resolves to the response from the IndexNow API
 */
export async function notifyIndexNow(url: string, keyLocation?: string): Promise<Response | null> {
  try {
    // Convert relative URLs to absolute URLs if needed
    const fullUrl = url.startsWith("http") ? url : `${SITE_URL}${url.startsWith("/") ? url : `/${url}`}`

    // Construct the IndexNow API URL
    const keyUrl = keyLocation || `${SITE_URL}/${INDEXNOW_KEY}.txt`
    const pingUrl = `https://www.bing.com/indexnow?url=${encodeURIComponent(fullUrl)}&key=${INDEXNOW_KEY}&keyLocation=${encodeURIComponent(keyUrl)}`

    // Send the notification
    const response = await fetch(pingUrl, {
      method: "GET",
      headers: {
        "User-Agent": "Flavor Studios IndexNow Notifier",
      },
    })

    if (!response.ok) {
      console.error(`IndexNow notification failed: ${response.status} ${response.statusText}`)
      return null
    }

    console.log(`IndexNow notification sent successfully for: ${fullUrl}`)
    return response
  } catch (error) {
    console.error("Error sending IndexNow notification:", error)
    return null
  }
}

/**
 * Notifies search engines about multiple URLs via IndexNow
 * @param urls Array of URLs that were created or updated
 * @returns Promise that resolves when all notifications are sent
 */
export async function notifyIndexNowBatch(urls: string[]): Promise<void> {
  if (!urls.length) return

  try {
    // Convert relative URLs to absolute URLs if needed
    const fullUrls = urls.map((url) =>
      url.startsWith("http") ? url : `${SITE_URL}${url.startsWith("/") ? url : `/${url}`}`,
    )

    // Use the Bing batch submission endpoint
    const response = await fetch(`https://www.bing.com/indexnow`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Flavor Studios IndexNow Notifier",
      },
      body: JSON.stringify({
        host: new URL(SITE_URL).hostname,
        key: INDEXNOW_KEY,
        urlList: fullUrls,
      }),
    })

    if (!response.ok) {
      console.error(`IndexNow batch notification failed: ${response.status} ${response.statusText}`)
      return
    }

    console.log(`IndexNow batch notification sent successfully for ${fullUrls.length} URLs`)
  } catch (error) {
    console.error("Error sending IndexNow batch notification:", error)
  }
}
