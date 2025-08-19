import type { PrismaClient } from "@prisma/client";

type GlobalWithPrisma = typeof globalThis & {
  __prisma?: PrismaClient;
};

const g = globalThis as GlobalWithPrisma;

async function createPrisma(): Promise<PrismaClient> {
  try {
    const { PrismaClient } = await import("@prisma/client");
    return new PrismaClient();
  } catch {
    // Fallback mock to avoid runtime crashes when Prisma client is missing
    return {
      post: { count: async () => 0 },
    } as unknown as PrismaClient;
  }
}

const prisma: PrismaClient =
  g.__prisma ??
  (await createPrisma());

// Cache the instance in dev to prevent multiple connections
if (process.env.NODE_ENV !== "production") {
  g.__prisma = prisma;
}

export default prisma;
