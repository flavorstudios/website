// lib/prisma.ts

import { serverEnv } from "@/env/server";

// Minimal local type so builds don’t require @prisma/client
export type PrismaClientLike = {
  post: { count: () => Promise<number> };
  draft: {
    findUnique: (args: unknown) => Promise<unknown>;
    upsert: (args: unknown) => Promise<unknown>;
  };
  $transaction: <T>(fn: (tx: unknown) => Promise<T>) => Promise<T>;
  $disconnect?: () => Promise<void>;
  __dbMissing?: true;
};

type GlobalWithPrisma = typeof globalThis & {
  __prisma?: PrismaClientLike;
};

const g = globalThis as GlobalWithPrisma;

async function createPrisma(): Promise<PrismaClientLike> {
  try {
    // Use eval to avoid bundling @prisma/client when it's absent
    const mod = (await (0, eval)("import('@prisma/client')")) as {
      PrismaClient: new () => unknown;
    };
    return new mod.PrismaClient() as unknown as PrismaClientLike;
  } catch {
    // Fallback mock to avoid runtime crashes when Prisma client is missing
    const draft = {
      findUnique: async () => null,
      upsert: async ({ create }: any) => create,
    };
    return {
      post: { count: async () => 0 },
      draft,
      $transaction: async (fn: any) => fn({ draft }),
      __dbMissing: true,
    };
  }
}

let prismaPromise: Promise<PrismaClientLike> | undefined;

/**
 * Lazily get a Prisma client (or a safe mock if @prisma/client is not installed).
 * Caches the instance in dev to prevent multiple connections during HMR.
 */
export async function getPrisma(): Promise<PrismaClientLike> {
  if (g.__prisma) return g.__prisma;
  if (!prismaPromise) {
    prismaPromise = (async () => {
      const client = await createPrisma();
      if (serverEnv.NODE_ENV !== "production") {
        g.__prisma = client;
      }
      return client;
    })();
  }
  return prismaPromise;
}

export default getPrisma;
