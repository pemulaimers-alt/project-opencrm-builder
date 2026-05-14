// =============================================================
// requireAuth guard plugin
//
// Mount inside any module that needs authentication.
//
// Uses .onBeforeHandle({ as: "scoped" }) — NOT .derive().
//
// Why beforeHandle and not derive:
//   .derive() decorates the request context. It runs before the
//   handler but its return value is merged INTO context, not
//   returned as a response. Setting set.status inside derive
//   mutates the eventual status code but does NOT stop the
//   handler from running — the route handler still executes.
//
//   .onBeforeHandle() is an interception hook. Per Elysia docs:
//   "When beforeHandle returns a value, it will skip the handler
//   and return the value instead." This is the correct hook for
//   authentication guards that must short-circuit execution.
//
// Scoping:
//   { as: "scoped" } means the hook applies to all routes in any
//   module that calls .use(requireAuth), without leaking to
//   sibling modules.
//
// Response shape:
//   401 { error: "Unauthorized" } — matches the contract's auth
//   error envelope exactly.
// =============================================================

import { Elysia } from "elysia";

export const requireAuth = new Elysia({ name: "guard:require-auth" }).onBeforeHandle(
  { as: "scoped" },
  ({ userId, set }) => {
    if (!userId) {
      set.status = 401;
      return { error: "Unauthorized" };
    }
  }
);
