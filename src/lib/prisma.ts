// src/lib/prisma.ts
import { PrismaClient } from "../generated/prisma";

// Use a singleton to avoid multiple connections in dev (hot reload creates new instances)
const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

const prismaClientSingleton = () => {
  return new PrismaClient();
};

// In dev: reuse global instance; in prod: new per request (but singleton is safe)
const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export { prisma };