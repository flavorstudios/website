import { prisma } from "./prisma"

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

export async function getCategoriesWithFallback(): Promise<DynamicCategoriesResult> {
  try {
    const [blogCats, videoCats] = await Promise.all([
      prisma.category.findMany({ where: { type: "blog", isActive: true }, orderBy: { name: "asc" } }),
      prisma.category.findMany({ where: { type: "video", isActive: true }, orderBy: { name: "asc" } }),
    ])

    const blogCategories: CategoryData[] = await Promise.all(
      blogCats.map(async (cat) => ({
        name: cat.name,
        slug: cat.slug,
        count: await prisma.blogPost.count({ where: { categoryId: cat.id, status: "published" } }),
      }))
    )

    const videoCategories: CategoryData[] = videoCats.map((cat) => ({
      name: cat.name,
      slug: cat.slug,
      count: cat.count ?? 0,
    }))

    return {
      blogCategories: blogCategories.length > 0 ? blogCategories : STATIC_CATEGORIES,
      videoCategories: videoCategories.length > 0 ? videoCategories : STATIC_CATEGORIES,
    }
  } catch (error) {
    console.warn("Failed to fetch categories from database:", error)
    return fallbackCategories
  }
}

export const getDynamicCategories = getCategoriesWithFallback
export const getDynamicCategoriesClient = getCategoriesWithFallback
