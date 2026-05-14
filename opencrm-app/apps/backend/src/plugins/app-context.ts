// =============================================================
// App Context Plugin (Phase 3)
//
// Global derive that resolves auth/tenant context on every request.
// Per builder contract (backend/blueprint.md):
//   1. Bearer token → session table → userId
//   2. Better Auth cookie → session → userId
//   3. userId → users.app_id → apps record → appUuid + orgSlug
//   4. Fallback: X-App-Id / X-App-Secret headers
//   5. X-Org-Slug header for org context
//
// Exposed to all downstream handlers via `store` context:
//   - userId: string | null
//   - appUuid: string | null
//   - orgSlug: string | null
// =============================================================

import { Elysia } from "elysia";
import { prisma } from "../lib/prisma";

export const appContext = new Elysia({ name: "app-context" }).derive(
  { as: "global" },
  async ({ headers, cookie }) => {
    let userId: string | null = null;
    let appUuid: string | null = null;
    let orgSlug: string | null = null;

    // 1. Try Bearer token from Authorization header
    const authHeader = headers["authorization"];
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      if (token) {
        try {
          const session = await prisma.session.findUnique({
            where: { token },
            select: { userId: true, expiresAt: true, activeOrganizationId: true },
          });
          if (session && session.expiresAt > new Date()) {
            userId = session.userId;
          }
        } catch {
          // Session lookup failed — continue to fallbacks
        }
      }
    }

    // 2. Try Better Auth session cookie (better-auth.session_token)
    if (!userId) {
      const sessionToken =
        cookie?.["better-auth.session_token"]?.value ||
        cookie?.["__Secure-better-auth.session_token"]?.value;
      if (sessionToken) {
        try {
          const session = await prisma.session.findUnique({
            where: { token: sessionToken },
            select: { userId: true, expiresAt: true, activeOrganizationId: true },
          });
          if (session && session.expiresAt > new Date()) {
            userId = session.userId;
          }
        } catch {
          // Cookie session lookup failed
        }
      }
    }

    // 3. Resolve app/org context from user
    if (userId) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { appId: true },
        });
        if (user?.appId) {
          appUuid = user.appId;
        }
      } catch {
        // User lookup failed
      }
    }

    // 4. X-Org-Slug header override
    const orgSlugHeader = headers["x-org-slug"];
    if (orgSlugHeader) {
      orgSlug = orgSlugHeader;
      // Resolve appUuid from org slug if not already set
      if (!appUuid) {
        try {
          const org = await prisma.organization.findUnique({
            where: { slug: orgSlug },
            select: { appId: true },
          });
          if (org?.appId) {
            appUuid = org.appId;
          }
        } catch {
          // Org lookup failed
        }
      }
    }

    // 5. Legacy X-App-Id fallback
    if (!appUuid) {
      const xAppId = headers["x-app-id"];
      if (xAppId) {
        try {
          const app = await prisma.app.findUnique({
            where: { appId: xAppId },
            select: { id: true },
          });
          if (app) {
            appUuid = app.id;
          }
        } catch {
          // App lookup failed
        }
      }
    }

    return { userId, appUuid, orgSlug };
  }
);
