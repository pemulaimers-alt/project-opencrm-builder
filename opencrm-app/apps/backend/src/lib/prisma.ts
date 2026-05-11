// =============================================================
// OpenCRM — Prisma client singleton (Phase 2)
//
// Uses the PrismaPg driver adapter to connect to PostgreSQL
// via a connection pool. This is the correct pattern for
// Prisma v7 with the Bun runtime.
//
// Prerequisites before importing this module:
//   1. DATABASE_URL set in apps/backend/.env
//   2. PostgreSQL running and reachable
//   3. Schema applied:  bun run db:push
//   4. Client generated: bun run db:generate
// =============================================================

import { PrismaClient } from "../generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

// Fail fast at startup — do not silently proceed without a DB URL
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "[prisma] DATABASE_URL is not set.\n" +
      "Copy apps/backend/.env.example → apps/backend/.env and set DATABASE_URL."
  );
}

// Connection pool — pg.Pool manages multiple connections efficiently.
// Bun's Prisma adapter requires this pool-based setup (not a single Client).
const pool = new pg.Pool({ connectionString });

const adapter = new PrismaPg(pool);

// Singleton — reuse the same PrismaClient instance across hot-reloads
// in development so we do not exhaust the connection pool.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
