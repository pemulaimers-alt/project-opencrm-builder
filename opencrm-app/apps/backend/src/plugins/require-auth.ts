// =============================================================
// requireAuth guard plugin
//
// Mount inside any module that needs authentication.
// Uses { as: "scoped" } so the guard applies to all routes
// within the module that uses it, without leaking to siblings.
//
// Returns 401 { error: "Unauthorized" } if userId is null,
// which matches the contract's auth error envelope exactly:
//   401 { error: 'Unauthorized' }
// =============================================================

import { Elysia } from "elysia";

export const requireAuth = new Elysia({ name: "guard:require-auth" }).derive(
  { as: "scoped" },
  ({ userId, set }) => {
    if (!userId) {
      set.status = 401;
      return { error: "Unauthorized" };
    }
    // userId is confirmed non-null from this point on
    return {};
  }
);
