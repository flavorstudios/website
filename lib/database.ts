import { getBlogPosts, getVideos, getBlogPostBySlug, getVideoBySlug } from "./content-store"

// Try to import prisma, but don't fail if it's not available
let prismaClient: any = null
try {
  // Dynamic import to avoid issues during build time
  const { prisma } = require("./prisma")
  prismaClient = prisma
} catch (error) {
  console.warn("Prisma client not available, using content store fallback")
}

// Database utility functions that work with or without Prisma
export async function getAllBlogs() {
  try {
    if (prismaClient) {
      return await prismaClient.blog.findMany({
        where: { published: true },
        include: { category: true },
        orderBy: { publishedAt: "desc" },
      })
    } else {
      return await getBlogPosts()
    }
  } catch (error) {
    console.error("Error fetching blogs:", error)
    return await getBlogPosts()
  }
}

export async function getAllVideos() {
  try {
    if (prismaClient) {
      return await prismaClient.video.findMany({
        where: { published: true },
        include: { category: true },
        orderBy: { publishedAt: "desc" },
      })
    } else {
      return await getVideos()
    }
  } catch (error) {
    console.error("Error fetching videos:", error)
    return await getVideos()
  }
}

export async function getBlogBySlug(slug: string) {
  try {
    if (prismaClient) {
      return await prismaClient.blog.findUnique({
        where: { slug },
        include: { category: true },
      })
    } else {
      return await getBlogPostBySlug(slug)
    }
  } catch (error) {
    console.error(`Error fetching blog with slug ${slug}:`, error)
    return await getBlogPostBySlug(slug)
  }
}

export async function getVideoBySlugDb(slug: string) {
  try {
    if (prismaClient) {
      return await prismaClient.video.findUnique({
        where: { slug },
        include: { category: true },
      })
    } else {
      return await getVideoBySlug(slug)
    }
  } catch (error) {
    console.error(`Error fetching video with slug ${slug}:`, error)
    return await getVideoBySlug(slug)
  }
}

// Check if database is connected
export async function isDatabaseConnected() {
  try {
    if (prismaClient) {
      // Try a simple query to check connection
      await prismaClient.$queryRaw`SELECT 1`
      return true
    }
    return false
  } catch (error) {
    console.error("Database connection check failed:", error)
    return false
  }
}
