import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Fix for Supabase SSL connection issues on Vercel
// Fix for Supabase SSL connection issues
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL;
const pool = connectionString 
  ? new Pool({ 
      connectionString,
      ssl: {
        rejectUnauthorized: false
      }
    })
  : null;
const adapter = pool ? new PrismaPg(pool) : null;

export const prisma =
  globalForPrisma.prisma ??
  (adapter 
    ? new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
      })
    : new PrismaClient());

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

