import type { Category } from "./category-store"
import path from "path"
import { promises as fs } from "fs"

let initialized = false

export interface CategoryData {
  name: string
  slug: string
  count: number
}

export interface DynamicCategoriesResult {
  blogCategories: CategoryData[]
  videoCategories: CategoryData[]
}

const STATIC_CATEGORIES: CategoryData[] = [
  { name: "Anime News", slug: "anime-news", count: 0 },
  { name: "Reviews", slug: "reviews", count: 0 },
  { name: "Behind the Scenes", slug: "behind-the-scenes", count: 0 },
  { name: "Tutorials", slug: "tutorials", count: 0 },
]

export const fallbackCategories: DynamicCategoriesResult = {
  blogCategories: STATIC_CATEGORIES,
  videoCategories: STATIC_CATEGORIES,
}

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

// ---- CATEGORY DATA INITIALIZATION ----
async function ensureCategoryDataInitialized() {
  if (typeof window === "undefined" && !initialized) {
    try {
      const { initializeDefaultCategories } = await import("./category-store")
      await initializeDefaultCategories()
      initialized = true
    } catch (error) {
      console.warn("Failed to initialize categories.json:", error)
    }
  }
}

// ---- LOAD CATEGORIES DIRECTLY FROM FILE (server fail-safe) ----
async function tryLoadCategoriesJson(type: "blog" | "video"): Promise<CategoryData[]> {
  try {
    const DATA_DIR = path.join(process.cwd(), "content-data")
    const categoriesPath = path.join(DATA_DIR, "categories.json")
    await fs.access(categoriesPath)
    const raw = await fs.readFile(categoriesPath, "utf-8")
    const allCategories: Category[] = JSON.parse(raw)
    // Filter for type and isActive
    const filtered = allCategories
      .filter((cat) => cat.type === type && cat.isActive)
      .map((cat) => ({
        name: cat.name,
        slug: createCategorySlug(cat.name),
        count: typeof cat.count === "number" ? cat.count : 0,
      }))
    if (filtered.length > 0) return filtered
  } catch (error) {
    // Silent fallback
  }
  return STATIC_CATEGORIES
}

// --------- MAIN EXPORT ---------
export async function getCategoriesWithFallback(): Promise<DynamicCategoriesResult> {
  await ensureCategoryDataInitialized()

  // --- Prefer API route (client or serverless) ---
  let blogCategories: CategoryData[] = []
  let videoCategories: CategoryData[] = []

  let usedApi = false

  try {
    if (typeof fetch !== "undefined") {
      const [blogsResponse, videosResponse] = await Promise.allSettled([
        fetch("/api/admin/blogs", {
          cache: "no-store",
          next: { revalidate: 0 },
        }).catch(() => null),
        fetch("/api/admin/videos", {
          cache: "no-store",
          next: { revalidate: 0 },
        }).catch(() => null),
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
              blogCategories = Array.from(categoryMap.entries()).map(([slug, count]) => ({
                name: formatCategoryName(slug),
                slug,
                count,
              }))
              blogCategories.sort((a, b) => {
                if (b.count !== a.count) return b.count - a.count
                return a.name.localeCompare(b.name)
              })
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
              videoCategories = Array.from(categoryMap.entries()).map(([slug, count]) => ({
                name: formatCategoryName(slug),
                slug,
                count,
              }))
              videoCategories.sort((a, b) => {
                if (b.count !== a.count) return b.count - a.count
                return a.name.localeCompare(b.name)
              })
            }
          }
        } catch (error) {
          console.warn("Error processing video categories:", error)
        }
      }
    }
  } catch (error) {
    console.warn("Failed to fetch dynamic categories, using static fallback:", error)
  }

  // --- If not loaded via API, try direct file read (SSR/build/server) ---
  if (!usedApi || blogCategories.length === 0 || videoCategories.length === 0) {
    if (typeof window === "undefined") {
      // On server, load directly from categories.json for fail-safe
      if (blogCategories.length === 0)
        blogCategories = await tryLoadCategoriesJson("blog")
      if (videoCategories.length === 0)
        videoCategories = await tryLoadCategoriesJson("video")
    }
  }

  // --- Fallback to STATIC_CATEGORIES if *still* empty ---
  return {
    blogCategories: blogCategories.length > 0 ? blogCategories : STATIC_CATEGORIES,
    videoCategories: videoCategories.length > 0 ? videoCategories : STATIC_CATEGORIES,
  }
}

// Server-side compatible function (alias for client function)
export const getDynamicCategories = getCategoriesWithFallback
export const getDynamicCategoriesClient = getCategoriesWithFallback
