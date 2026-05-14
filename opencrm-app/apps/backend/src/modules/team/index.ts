// =============================================================
// Team Module Routes (Phase 3)
//
// Per API contract:
//   GET    /api/teams/           — list teams
//   GET    /api/teams/:id        — get team
//   POST   /api/teams/           — create team
//   PATCH  /api/teams/:id        — update team
//   DELETE /api/teams/:id        — delete team
//   POST   /api/teams/:id/members    — add member
//   DELETE /api/teams/:id/members/:userId — remove member
// =============================================================

import { Elysia, t } from "elysia";
import { requireAuth } from "../../plugins/require-auth";
import { TeamService } from "./service";

export const teamModule = new Elysia({ name: "module:team", prefix: "/teams" })
  .use(requireAuth)

  .get("/", async ({ appUuid }) => {
    const teams = await TeamService.list(appUuid);
    return { success: true, payload: teams };
  })

  .get("/:id", async ({ params, set }) => {
    const team = await TeamService.getById(params.id);
    if (!team) {
      set.status = 404;
      return { error: "Team not found" };
    }
    return { success: true, payload: team };
  }, { params: t.Object({ id: t.String() }) })

  .post("/", async ({ body, appUuid }) => {
    const team = await TeamService.create({
      name: body.name,
      description: body.description,
      appId: appUuid,
    });
    return { success: true, payload: team };
  }, {
    body: t.Object({
      name: t.String(),
      description: t.Optional(t.String()),
    }),
  })

  .patch("/:id", async ({ params, body, set }) => {
    try {
      const team = await TeamService.update(params.id, body);
      return { success: true, payload: team };
    } catch {
      set.status = 404;
      return { error: "Team not found" };
    }
  }, {
    params: t.Object({ id: t.String() }),
    body: t.Object({
      name: t.Optional(t.String()),
      description: t.Optional(t.String()),
    }),
  })

  .delete("/:id", async ({ params, set }) => {
    try {
      await TeamService.delete(params.id);
      return { success: true };
    } catch {
      set.status = 404;
      return { error: "Team not found" };
    }
  }, { params: t.Object({ id: t.String() }) })

  .post("/:id/members", async ({ params, body }) => {
    const result = await TeamService.addMember(params.id, body.userId);
    return { success: true, payload: result };
  }, {
    params: t.Object({ id: t.String() }),
    body: t.Object({ userId: t.String() }),
  })

  .delete("/:id/members/:userId", async ({ params, set }) => {
    try {
      await TeamService.removeMember(params.id, params.userId);
      return { success: true };
    } catch {
      set.status = 404;
      return { error: "Member not found" };
    }
  }, { params: t.Object({ id: t.String(), userId: t.String() }) });
