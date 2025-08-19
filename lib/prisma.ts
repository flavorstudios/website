import type { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;
try {
  const { PrismaClient: PrismaClientCtor } = require('@prisma/client');
  prisma = new PrismaClientCtor();
} catch {
  // Fallback mock to avoid runtime crashes when Prisma client is missing
  prisma = {
    post: { count: async () => 0 },
  } as unknown as PrismaClient;
}

export default prisma;