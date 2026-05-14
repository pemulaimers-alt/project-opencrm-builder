// =============================================================
// Better Auth Configuration (Phase 3)
//
// Per builder contract (backend/blueprint.md):
//   - Database: Prisma adapter
//   - Session: 7-day expiry, daily renewal
//   - UUID generation: crypto.randomUUID()
//   - Plugins: organization
//   - Trusted origins from env TRUSTED_ORIGINS + defaults
//
// Mounted at root /auth/* in src/index.ts
// =============================================================

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { organization } from "better-auth/plugins";
import { prisma } from "./lib/prisma";

const trustedOrigins = (process.env.TRUSTED_ORIGINS ?? "http://localhost:3005")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3010",
  trustedOrigins,

  emailAndPassword: {
    enabled: true,
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Refresh session daily
  },

  advanced: {
    generateId: () => crypto.randomUUID(),
  },

  plugins: [
    organization(),
  ],
});
