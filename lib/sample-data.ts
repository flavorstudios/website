// All categories are now managed dynamically—no more static arrays for seeding!

import { getAdminDb } from "@/lib/firebase-admin"
import { blogStore, videoStore, pageStore } from "./content-store"

export const initialStats = {
  youtubeSubscribers: "500K+",
  originalEpisodes: "50+",
  totalViews: "2M+",
  yearsCreating: "5",
  lastUpdated: new Date().toISOString(),
}

/**
 * Populate Firestore with some baseline demo content.
 * - Adds a sample blog post, video, and home page stats if collections are empty.
 */
export async function initializeSampleData(): Promise<void> {
  const db = getAdminDb();
  const blogCheck = await db.collection("blogs").limit(1).get()
  if (blogCheck.empty) {
    const now = new Date().toISOString()
    await blogStore.create({
      title: "Welcome to Flavor Studios",
      slug: "welcome-to-flavor-studios",
      content: "This is a sample blog post created during seeding.",
      excerpt: "This is a sample blog post created during seeding.",
      status: "published",
      category: "general",
      categories: ["general"],
      tags: ["sample"],
      featuredImage: "/cover.jpg",
      seoTitle: "Welcome to Flavor Studios",
      seoDescription: "Sample blog post for development.",
      author: "Admin",
      publishedAt: now,
    })
  }

  const videoCheck = await db.collection("videos").limit(1).get()
  if (videoCheck.empty) {
    const now = new Date().toISOString()
    await videoStore.create({
      title: "Sample Video",
      slug: "sample-video",
      description: "A sample video for development.",
      youtubeId: "dQw4w9WgXcQ",
      thumbnail: "/cover.jpg",
      duration: "1:00",
      category: "videos",
      tags: ["sample"],
      status: "published",
      publishedAt: now,
    })
  }

  await pageStore.update("home", "stats", initialStats, "seed")
}

// If you want demo/sample blog, video, or comment content for local/dev environments,
// fetch or generate it directly in your seed scripts or use separate JSON for migration purposes.
// No more static arrays in the main codebase.
