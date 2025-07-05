// All categories are now managed dynamically via Prisma—no hardcoded validBlogCategories or validWatchCategories!

export const sampleBlogs: any[] = []

export const sampleVideos: any[] = []

export const sampleComments: any[] = []

export const initialStats = {
  youtubeSubscribers: "500K+",
  originalEpisodes: "50+",
  totalViews: "2M+",
  yearsCreating: "5",
  lastUpdated: new Date().toISOString(),
}
