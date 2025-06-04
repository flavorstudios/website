// lib/dynamic-categories.ts

import type { Category } from "./category-store"

export interface CategoryData {
  name: string
  slug: string
  count: number
}

export interface DynamicCategoriesResult {
  blogCategories: CategoryData[]
  videoCategories: CategoryData[]
}

// --- STATIC FALLBACK ---
const STATIC_CATEGORIES: CategoryData[] = [
  { name: "Anime News", slug: "anime-news", count: 0 },
  { name: "Studio Originals", slug: "studio-originals", count: 0 },
  { name: "Behind the Scenes", slug: "behind-the-scenes", count: 0 },
  { name: "Tutorials", slug: "tutorials", count: 0 },
  { name: "Reviews", slug: "reviews", count: 0 },
  { name: "Inspiration & Life", slug: "inspiration-life", count: 0 },
  { name: "Industry Insights", slug: "industry-insights", count: 0 },
  { name: "Community & Events", slug: "community-events", count: 0 },
  { name: "Interviews", slug: "interviews", count: 0 },
]

export const fallbackCategories: DynamicCategoriesResult = {
  blogCategories: STATIC_CATEGORIES,
  videoCategories: STATIC_CATEGORIES,
}

// -- UTILITIES --
export function createCategorySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}
export function getCategoryBySlug(categories: CategoryData[], slug: string): CategoryData | undefined {
  return categories.find((cat) => cat.slug === slug)
}
export function formatCategoryName(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

// --- MAIN: DYNAMIC LOADING (API first, fallback static) ---
export async function getCategoriesWithFallback(): Promise<DynamicCategoriesResult> {
  let blogCategories: CategoryData[] = []
  let videoCategories: CategoryData[] = []
  let usedApi = false

  try {
    // Use absolute API URLs for server-side builds (for Next.js SSR/ISR)
    const baseUrl =
      typeof window === "undefined"
        ? process.env.NEXT_PUBLIC_BASE_URL || "https://flavorstudios.in"
        : ""

    const [blogsResponse, videosResponse] = await Promise.allSettled([
      fetch(`${baseUrl}/api/admin/blogs`, { cache: "no-store" }).catch(() => null),
      fetch(`${baseUrl}/api/admin/videos`, { cache: "no-store" }).catch(() => null),
    ])

    if (blogsResponse.status === "fulfilled" && blogsResponse.value?.ok) {
      usedApi = true
      try {
        const blogsData = await blogsResponse.value.json()
        const posts = blogsData.posts || []
        if (posts.length > 0) {
          const categoryMap = new Map<string, number>()
          posts
            .filter((post: any) => post.status === "published")
            .forEach((post: any) => {
              if (post.category) {
                const slug = createCategorySlug(post.category)
                categoryMap.set(slug, (categoryMap.get(slug) || 0) + 1)
              }
            })
          if (categoryMap.size > 0) {
            blogCategories = Array.from(categoryMap.entries())
              .map(([slug, count]) => ({ name: formatCategoryName(slug), slug, count }))
              .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
          }
        }
      } catch (error) {
        console.warn("Error processing blog categories:", error)
      }
    }

    if (videosResponse.status === "fulfilled" && videosResponse.value?.ok) {
      usedApi = true
      try {
        const videosData = await videosResponse.value.json()
        const videos = videosData.videos || []
        if (videos.length > 0) {
          const categoryMap = new Map<string, number>()
          videos
            .filter((video: any) => video.status === "published")
            .forEach((video: any) => {
              if (video.category) {
                const slug = createCategorySlug(video.category)
                categoryMap.set(slug, (categoryMap.get(slug) || 0) + 1)
              }
            })
          if (categoryMap.size > 0) {
            videoCategories = Array.from(categoryMap.entries())
              .map(([slug, count]) => ({ name: formatCategoryName(slug), slug, count }))
              .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
          }
        }
      } catch (error) {
        console.warn("Error processing video categories:", error)
      }
    }
  } catch (error) {
    console.warn("Failed to fetch dynamic categories, using static fallback:", error)
  }

  // Final fallback to static categories if still empty
  let finalBlogCategories = blogCategories.length > 0 ? blogCategories : STATIC_CATEGORIES
  let finalVideoCategories = videoCategories.length > 0 ? videoCategories : STATIC_CATEGORIES

  // Remove any accidental "all" slug
  finalBlogCategories = finalBlogCategories.filter((c) => c.slug !== "all")
  finalVideoCategories = finalVideoCategories.filter((c) => c.slug !== "all")

  return {
    blogCategories: finalBlogCategories,
    videoCategories: finalVideoCategories,
  }
}

// --- Aliases ---
export const getDynamicCategories = getCategoriesWithFallback
export const getDynamicCategoriesClient = getCategoriesWithFallback