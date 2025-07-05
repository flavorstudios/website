// All categories are now managed dynamically via Prisma—no more static arrays for seeding!

export const initialStats = {
  youtubeSubscribers: "500K+",
  originalEpisodes: "50+",
  totalViews: "2M+",
  yearsCreating: "5",
  lastUpdated: new Date().toISOString(),
}

// If you want demo/sample blog, video, or comment content for local/dev environments,
// fetch/generate it directly via Prisma in your seed.ts or use separate JSON for migration purposes.
// No more static arrays in the main codebase.
