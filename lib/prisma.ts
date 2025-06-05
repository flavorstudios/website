// /lib/prisma.ts

import { PrismaClient } from "@prisma/client"

// Use a global variable to prevent multiple PrismaClient instances in development (HMR)
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ["query"], // Log SQL queries, adjust or remove in production
  })

if (process.env.NODE_ENV !== "production") global.prisma = prisma
