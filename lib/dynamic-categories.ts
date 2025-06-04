import type { Category } from "./category-store"

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

// Static fallback categories — brand aligned
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

// Utility: Create URL-friendly slug from category name
export function createCategorySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

// Utility: Find category by slug
export function getCategoryBySlug(categories: CategoryData[], slug: string): CategoryData | undefined {
  return categories.find((cat) => cat.slug === slug)
}

// Utility: Format slug back to readable category name
export function formatCategoryName(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

// Server-side initialization of categories (runs once)
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

// Load categories.json from file on server (fallback)
async function tryLoadCategoriesJson(type: "blog" | "video"): Promise<CategoryData[]> {
  if (typeof window !== "undefined") return STATIC_CATEGORIES // Prevent running on client

  try {
    const path = await import("path")
    const fs = await import("fs/promises")
    const DATA_DIR = path.join(process.cwd(), "content-data")
    const categoriesPath = path.join(DATA_DIR, "categories.json")

    await fs.access(categoriesPath)
    const raw = await fs.readFile(categoriesPath, "utf-8")
    const allCategories: Category[] = JSON.parse(raw)

    const filtered = allCategories
      .filter((cat) => cat.type === type && cat.isActive)
      .map((cat) => ({
        name: cat.name,
        slug: createCategorySlug(cat.name),
        count: typeof cat.count === "number" ? cat.count : 0,
      }))
      .filter((cat) => cat.slug !== "all") // Reserved slug

    if (filtered.length > 0) return filtered
  } catch {
    // silent fallback to static categories
  }

  return STATIC_CATEGORIES
}

// Main exported function to get categories dynamically with fallbacks
export async function getCategoriesWithFallback(): Promise<DynamicCategoriesResult> {
  await ensureCategoryDataInitialized()

  let blogCategories: CategoryData[] = []
  let videoCategories: CategoryData[] = []
  let usedApi = false

  try {
    if (typeof fetch !== "undefined") {
      const [blogsResponse, videosResponse] = await Promise.allSettled([
        fetch("/api/admin/blogs", { cache: "no-store", next: { revalidate: 0 } }).catch(() => null),
        fetch("/api/admin/videos", { cache: "no-store", next: { revalidate: 0 } }).catch(() => null),
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
    }
  } catch (error) {
    console.warn("Failed to fetch dynamic categories, using static fallback:", error)
  }

  // Fallback: try direct file loading on server if API not used or categories empty
  if (!usedApi || blogCategories.length === 0 || videoCategories.length === 0) {
    if (typeof window === "undefined") {
      if (blogCategories.length === 0) blogCategories = await tryLoadCategoriesJson("blog")
      if (videoCategories.length === 0) videoCategories = await tryLoadCategoriesJson("video")
    }
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

// Aliases for convenience
export const getDynamicCategories = getCategoriesWithFallback
export const getDynamicCategoriesClient = getCategoriesWithFallback