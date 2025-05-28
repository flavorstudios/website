import { getBlogPosts, getVideos, getBlogPostBySlug, getVideoBySlug } from "./content-store"

// Database utility functions that work with or without Prisma
export async function getAllBlogs() {
  try {
    // Try to use Prisma if available
    if (typeof window === "undefined" && process.env.DATABASE_URL) {
      const { getPrismaClient } = await import("./prisma")
      const prisma = await getPrismaClient()

      if (prisma) {
        return await prisma.blog.findMany({
          where: { published: true },
          include: { category: true },
          orderBy: { publishedAt: "desc" },
        })
      }
    }
  } catch (error) {
    console.warn("Prisma not available, using content store:", error)
  }

  // Fallback to content store
  return await getBlogPosts()
}

export async function getAllVideos() {
  try {
    // Try to use Prisma if available
    if (typeof window === "undefined" && process.env.DATABASE_URL) {
      const { getPrismaClient } = await import("./prisma")
      const prisma = await getPrismaClient()

      if (prisma) {
        return await prisma.video.findMany({
          where: { published: true },
          include: { category: true },
          orderBy: { publishedAt: "desc" },
        })
      }
    }
  } catch (error) {
    console.warn("Prisma not available, using content store:", error)
  }

  // Fallback to content store
  return await getVideos()
}

export async function getBlogBySlug(slug: string) {
  try {
    // Try to use Prisma if available
    if (typeof window === "undefined" && process.env.DATABASE_URL) {
      const { getPrismaClient } = await import("./prisma")
      const prisma = await getPrismaClient()

      if (prisma) {
        return await prisma.blog.findUnique({
          where: { slug },
          include: { category: true },
        })
      }
    }
  } catch (error) {
    console.warn("Prisma not available, using content store:", error)
  }

  // Fallback to content store
  return await getBlogPostBySlug(slug)
}

export async function getVideoBySlugDb(slug: string) {
  try {
    // Try to use Prisma if available
    if (typeof window === "undefined" && process.env.DATABASE_URL) {
      const { getPrismaClient } = await import("./prisma")
      const prisma = await getPrismaClient()

      if (prisma) {
        return await prisma.video.findUnique({
          where: { slug },
          include: { category: true },
        })
      }
    }
  } catch (error) {
    console.warn("Prisma not available, using content store:", error)
  }

  // Fallback to content store
  return await getVideoBySlug(slug)
}

// Check if database is connected
export async function isDatabaseConnected() {
  try {
    if (typeof window === "undefined" && process.env.DATABASE_URL) {
      const { getPrismaClient } = await import("./prisma")
      const prisma = await getPrismaClient()

      if (prisma) {
        // Try a simple query to check connection
        await prisma.$queryRaw`SELECT 1`
        return true
      }
    }
    return false
  } catch (error) {
    console.error("Database connection check failed:", error)
    return false
  }
}
