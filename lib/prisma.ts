// Conditional Prisma client that only loads when needed
let prismaClient: any = null

export async function getPrismaClient() {
  if (prismaClient) {
    return prismaClient
  }

  try {
    // Only try to load Prisma if we're in a server environment and have DATABASE_URL
    if (typeof window === "undefined" && process.env.DATABASE_URL) {
      const { PrismaClient } = await import("@prisma/client")
      prismaClient = new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
      })
      return prismaClient
    }
  } catch (error) {
    console.warn("Prisma client not available:", error)
  }

  return null
}

// Export a lazy-loaded prisma instance
export const prisma = new Proxy({} as any, {
  get(target, prop) {
    return async (...args: any[]) => {
      const client = await getPrismaClient()
      if (!client) {
        throw new Error("Prisma client not available")
      }
      return client[prop](...args)
    }
  },
})
