// All categories are now managed dynamically—no more static arrays for seeding!

import "server-only"

import { isAdminSdkAvailable } from "@/lib/firebase-admin"
import { logger } from "@/lib/logger"
import { pageStore } from "./content-store"

export const initialStats = {
  youtubeSubscribers: "500K+",
  originalEpisodes: "50+",
  totalViews: "2M+",
  yearsCreating: "5",
  lastUpdated: new Date().toISOString(),
}

/**
 * Populate Firestore with baseline stats only. No demo content is created.
 * - Adds a sample blog post, video, and home page stats if collections are empty.
 */
export async function initializeSampleData(): Promise<void> {
  if (!isAdminSdkAvailable()) {
    logger.debug("[Sample Data] Skipping stats initialization: Firebase Admin SDK unavailable.")
    return
  }
  await pageStore.update("home", "stats", initialStats, "seed")
}

export async function initializeHomeStats(): Promise<void> {
  await initializeSampleData()
}

// If you want demo/sample blog, video, or comment content for local/dev environments,
// fetch or generate it directly in your seed scripts or use separate JSON for migration purposes.
// No more static arrays in the main codebase.
