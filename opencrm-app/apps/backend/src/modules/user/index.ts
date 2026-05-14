// =============================================================
// User Module Routes (Phase 3)
//
// Per API contract:
//   GET  /api/user/       — list users
//   GET  /api/user/:id    — get user by id
//   PATCH /api/user/:id   — update user profile
// =============================================================

import { Elysia, t } from "elysia";
import { requireAuth } from "../../plugins/require-auth";
import { UserService } from "./service";

export const userModule = new Elysia({ name: "module:user", prefix: "/user" })
  .use(requireAuth)

  .get("/", async ({ appUuid }) => {
    const users = await UserService.list(appUuid);
    return { data: users };
  })

  .get("/:id", async ({ params, set }) => {
    const user = await UserService.getById(params.id);
    if (!user) {
      set.status = 404;
      return { error: "User not found" };
    }
    return { data: user };
  }, { params: t.Object({ id: t.String() }) })

  .patch("/:id", async ({ params, body, set }) => {
    try {
      const user = await UserService.update(params.id, body);
      return { data: user };
    } catch {
      set.status = 404;
      return { error: "User not found" };
    }
  }, {
    params: t.Object({ id: t.String() }),
    body: t.Object({
      name: t.Optional(t.String()),
      avatar_url: t.Optional(t.String()),
      phone: t.Optional(t.String()),
    }),
  });
