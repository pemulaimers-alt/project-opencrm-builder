// =============================================================
// Auth Module — Authority Routes (Phase 3)
//
// Per builder contract (API-CONTRACTS.md):
//   POST /api/auth/login    — legacy login (compatibility)
//   GET  /api/auth/context  — current session + org context
//   POST /api/auth/onboarding — create organization
//   GET  /api/auth/me       — current user profile
//   POST /api/auth/logout   — destroy session
//
// Note: POST /auth/sign-in/email and POST /auth/sign-up/email
// are handled by Better Auth at root level, not here.
// =============================================================

import { Elysia, t } from "elysia";
import { AuthService } from "./service";

export const authModule = new Elysia({ name: "module:auth", prefix: "/auth" })

  // POST /api/auth/login — legacy compatibility login
  .post(
    "/login",
    async ({ body, set }) => {
      const result = await AuthService.login(body.email, body.password);
      if (!result.success) {
        set.status = 401;
        return { error: result.error };
      }
      return { success: true, data: result.data };
    },
    {
      body: t.Object({
        email: t.String(),
        password: t.String(),
        app_id: t.Optional(t.String()),
      }),
    }
  )

  // GET /api/auth/context — session + organization context
  .get("/context", async ({ userId, appUuid, orgSlug, set }) => {
    if (!userId) {
      set.status = 401;
      return { error: "Unauthorized" };
    }
    const data = await AuthService.getContext(userId, appUuid, orgSlug);
    return { success: true, data };
  })

  // POST /api/auth/onboarding — create organization for current user
  .post(
    "/onboarding",
    async ({ userId, body, set }) => {
      if (!userId) {
        set.status = 401;
        return { error: "Unauthorized" };
      }
      const result = await AuthService.onboarding(userId, body.companyName, body.slug);
      if (!result.success) {
        set.status = 400;
        return { error: result.error };
      }
      return { success: true, data: result.data };
    },
    {
      body: t.Object({
        companyName: t.String(),
        slug: t.Optional(t.String()),
      }),
    }
  )

  // GET /api/auth/me — current user profile
  .get("/me", async ({ userId, set }) => {
    if (!userId) {
      set.status = 401;
      return { error: "Unauthorized" };
    }
    const user = await AuthService.getMe(userId);
    if (!user) {
      set.status = 404;
      return { error: "User not found" };
    }
    return { success: true, data: user };
  })

  // POST /api/auth/logout — destroy session (placeholder — Better Auth handles actual invalidation)
  .post("/logout", async ({ userId, set }) => {
    if (!userId) {
      set.status = 401;
      return { error: "Unauthorized" };
    }
    return { success: true };
  });
