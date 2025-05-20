import { blogCategories } from "./blogCategories"
import { watchCategories } from "./watchCategories"

// Define types for search results
export type SearchResultItem = {
  title: string
  description: string
  url: string
  type: "blog" | "watch" | "blog-category" | "watch-category"
  matches: string[]
}

// Mock function to search blog posts - replace with actual implementation
export async function searchBlogPosts(query: string): Promise<SearchResultItem[]> {
  // This would typically fetch from your CMS or database
  // For now, we'll return mock data
  const mockPosts = [
    {
      title: "Understanding Anime Character Design",
      description: "A deep dive into what makes anime character designs so distinctive and memorable.",
      url: "/blog/understanding-anime-character-design",
    },
    {
      title: "The Evolution of Studio Ghibli",
      description: "Exploring how Studio Ghibli has evolved over the decades and influenced animation worldwide.",
      url: "/blog/evolution-of-studio-ghibli",
    },
    {
      title: "Blender Tips for Anime Creation",
      description: "Essential Blender techniques for creating anime-style 3D animations.",
      url: "/blog/blender-tips-anime-creation",
    },
  ]

  if (!query) return []

  const lowerQuery = query.toLowerCase()
  return mockPosts
    .filter(
      (post) => post.title.toLowerCase().includes(lowerQuery) || post.description.toLowerCase().includes(lowerQuery),
    )
    .map((post) => ({
      ...post,
      type: "blog" as const,
      matches: [
        post.title.toLowerCase().includes(lowerQuery) ? "title" : "",
        post.description.toLowerCase().includes(lowerQuery) ? "description" : "",
      ].filter(Boolean),
    }))
}

// Mock function to search watch videos - replace with actual implementation
export async function searchWatchVideos(query: string): Promise<SearchResultItem[]> {
  // This would typically fetch from your CMS or database
  const mockVideos = [
    {
      title: "Creating Anime Eyes in Blender",
      description: "Tutorial on creating expressive anime eyes using Blender's shader system.",
      url: "/watch/creating-anime-eyes-blender",
    },
    {
      title: "Anime Hair Animation Techniques",
      description: "Advanced techniques for animating flowing anime hair in 3D.",
      url: "/watch/anime-hair-animation",
    },
    {
      title: "Lighting for Anime-Style Renders",
      description: "How to set up lighting that complements anime-style 3D models.",
      url: "/watch/lighting-anime-renders",
    },
  ]

  if (!query) return []

  const lowerQuery = query.toLowerCase()
  return mockVideos
    .filter(
      (video) => video.title.toLowerCase().includes(lowerQuery) || video.description.toLowerCase().includes(lowerQuery),
    )
    .map((video) => ({
      ...video,
      type: "watch" as const,
      matches: [
        video.title.toLowerCase().includes(lowerQuery) ? "title" : "",
        video.description.toLowerCase().includes(lowerQuery) ? "description" : "",
      ].filter(Boolean),
    }))
}

// Function to search blog categories
export function searchBlogCategories(query: string): SearchResultItem[] {
  if (!query) return []

  const lowerQuery = query.toLowerCase()
  return Object.entries(blogCategories)
    .filter(
      ([slug, category]) =>
        category.title.toLowerCase().includes(lowerQuery) ||
        category.description.toLowerCase().includes(lowerQuery) ||
        category.heading.toLowerCase().includes(lowerQuery),
    )
    .map(([slug, category]) => ({
      title: category.heading,
      description: category.description,
      url: `/blog/category/${slug}`,
      type: "blog-category" as const,
      matches: [
        category.heading.toLowerCase().includes(lowerQuery) ? "heading" : "",
        category.description.toLowerCase().includes(lowerQuery) ? "description" : "",
        category.title.toLowerCase().includes(lowerQuery) ? "title" : "",
      ].filter(Boolean),
    }))
}

// Function to search watch categories
export function searchWatchCategories(query: string): SearchResultItem[] {
  if (!query) return []

  const lowerQuery = query.toLowerCase()
  return Object.entries(watchCategories)
    .filter(
      ([slug, category]) =>
        category.title.toLowerCase().includes(lowerQuery) ||
        category.description.toLowerCase().includes(lowerQuery) ||
        category.heading.toLowerCase().includes(lowerQuery),
    )
    .map(([slug, category]) => ({
      title: category.heading,
      description: category.description,
      url: `/watch/category/${slug}`,
      type: "watch-category" as const,
      matches: [
        category.heading.toLowerCase().includes(lowerQuery) ? "heading" : "",
        category.description.toLowerCase().includes(lowerQuery) ? "description" : "",
        category.title.toLowerCase().includes(lowerQuery) ? "title" : "",
      ].filter(Boolean),
    }))
}

// Main search function that combines all results
export async function searchAll(query: string): Promise<SearchResultItem[]> {
  if (!query || query.trim() === "") return []

  const [blogResults, watchResults] = await Promise.all([searchBlogPosts(query), searchWatchVideos(query)])

  const categoryResults = [...searchBlogCategories(query), ...searchWatchCategories(query)]

  return [...blogResults, ...watchResults, ...categoryResults]
}

// Simple text-only highlight function that doesn't use JSX
export function highlightMatch(text: string, query: string): string {
  if (!query || !text) return text

  // For server-side rendering safety, return plain text
  return text
}
