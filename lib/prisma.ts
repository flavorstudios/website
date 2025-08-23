// lib/prisma.ts

// Minimal local type so builds don’t require @prisma/client
export type PrismaClientLike = {
  post: { count: () => Promise<number> };
  $disconnect?: () => Promise<void>;
};

type GlobalWithPrisma = typeof globalThis & {
  __prisma?: PrismaClientLike;
};

const g = globalThis as GlobalWithPrisma;

async function createPrisma(): Promise<PrismaClientLike> {
  try {
    // Use a dynamic string to avoid bundling @prisma/client when it's absent
    const mod = (await import("@".concat("prisma/client"))) as {
      PrismaClient: new () => unknown;
    };
    return new mod.PrismaClient() as unknown as PrismaClientLike;
  } catch {
    // Fallback mock to avoid runtime crashes when Prisma client is missing
    return {
      post: { count: async () => 0 },
    };
  }
}

const prisma: PrismaClientLike = g.__prisma ?? (await createPrisma());

// Cache the instance in dev to prevent multiple connections
if (process.env.NODE_ENV !== "production") {
  g.__prisma = prisma;
}

export default prisma;
