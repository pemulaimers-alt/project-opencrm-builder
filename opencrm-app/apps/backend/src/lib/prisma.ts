// =============================================================
// Prisma client singleton
//
// Phase 1: stub — wiring is here, but the generated client
// won't exist until `bun run db:generate` is run after Phase 2
// schema is finalized.
// =============================================================

// Uncomment after running `bun run db:generate` in Phase 2:
// import { PrismaClient } from "../generated/client";
// import { PrismaPg } from "@prisma/adapter-pg";
// import pg from "pg";
//
// const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
// const adapter = new PrismaPg(pool);
//
// const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
//
// export const prisma =
//   globalForPrisma.prisma ?? new PrismaClient({ adapter, log: ["error", "warn"] });
//
// if (process.env.NODE_ENV !== "production") {
//   globalForPrisma.prisma = prisma;
// }
//
// export default prisma;

export {};
