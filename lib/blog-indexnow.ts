import { notifyIndexNow } from "@/lib/indexnow"
import { revalidateBlog, revalidateHome, revalidateWatch } from "@/app/actions/revalidate"

/**
 * Utility to notify IndexNow when a new blog post is published
 * This can be called from any component or server action that handles blog post creation/updates
 */
export async function notifyBlogPostIndexNow(slug: string): Promise<void> {
  const blogUrl = `/blog/${slug}`
  await notifyIndexNow(blogUrl)

  // Also notify the blog index page since it will show the new post
  await notifyIndexNow("/blog")

  // Revalidate the blog page and home page to show the new content
  await revalidateBlog()
  await revalidateHome()
}

/**
 * Utility to notify IndexNow when a new watch episode is published
 */
export async function notifyWatchEpisodeIndexNow(slug: string): Promise<void> {
  const watchUrl = `/watch/${slug}`
  await notifyIndexNow(watchUrl)

  // Also notify the watch index page
  await notifyIndexNow("/watch")

  // Revalidate the watch page and home page to show the new content
  await revalidateWatch()
  await revalidateHome()
}

/**
 * Utility to notify IndexNow when a new game is published
 */
export async function notifyGameIndexNow(slug: string): Promise<void> {
  const gameUrl = `/play/${slug}`
  await notifyIndexNow(gameUrl)

  // Also notify the play index page
  await notifyIndexNow("/play")

  // Revalidate the home page to show the new content
  await revalidateHome()
}
