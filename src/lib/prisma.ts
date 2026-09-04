import { PrismaClient } from "@/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const connectionString = process.env.DATABASE_URL!;

const adapter = new PrismaNeon({
  connectionString,
});

// Bump after breaking schema changes so Next.js HMR does not reuse a
// PrismaClient compiled against the old field types.
const PRISMA_CLIENT_REV = 2;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaClientRev?: number;
};

if (globalForPrisma.prismaClientRev !== PRISMA_CLIENT_REV) {
  void globalForPrisma.prisma?.$disconnect();
  globalForPrisma.prisma = undefined;
  globalForPrisma.prismaClientRev = PRISMA_CLIENT_REV;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
