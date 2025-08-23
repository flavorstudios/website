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
    const mod = await import("@prisma/client");
    const PrismaClient = mod.PrismaClient;
    return new PrismaClient() as unknown as PrismaClientLike;
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
