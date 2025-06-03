// /lib/video.ts

import type { Video } from "./data"

const BASE_URL =
  typeof window === "undefined"
    ? process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    : ""

function getApiUrl(path: string) {
  return typeof window === "undefined"
    ? `${BASE_URL}${path}`
    : path
}

// --- Video Store ---
export const videoStore = {
  async getAllVideos(): Promise<Video[]> {
    try {
      const response = await fetch(getApiUrl("/api/admin/videos"), {
        cache: "no-store",
      })
      if (response.ok) {
        const videos = await response.json()
        // Some APIs return { videos: [...] }, some just return [...]
        return Array.isArray(videos) ? videos : videos.videos || []
      }
    } catch (error) {
      console.warn("Failed to fetch videos:", error)
    }
    return []
  },

  async getVideoBySlug(slug: string): Promise<Video | null> {
    try {
      const videos = await this.getAllVideos()
      return (
        videos.find(
          (video) =>
            (video.slug === slug || video.id === slug) &&
            (video.status ? video.status === "published" : true)
        ) || null
      )
    } catch (error) {
      console.warn("Failed to fetch video:", error)
      return null
    }
  },
}
