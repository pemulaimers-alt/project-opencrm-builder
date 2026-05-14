// =============================================================
// Activity Module Routes (Phase 3)
// =============================================================

import { Elysia, t } from "elysia";
import { ActivityService } from "./service";

export const activityModule = new Elysia({ name: "module:activity", prefix: "/activities" })

  .get("/", async ({ appUuid, query }) => {
    const activities = await ActivityService.list(appUuid, {
      customerId: query.customerId || undefined,
      dealId: query.dealId || undefined,
      contactId: query.contactId || undefined,
      type: query.type || undefined,
    });
    return { data: activities };
  }, {
    query: t.Object({
      customerId: t.Optional(t.String()),
      dealId: t.Optional(t.String()),
      contactId: t.Optional(t.String()),
      type: t.Optional(t.String()),
    }),
  })

  .get("/:id", async ({ params, set }) => {
    const activity = await ActivityService.getById(params.id);
    if (!activity) {
      set.status = 404;
      return { error: "Activity not found" };
    }
    return { data: activity };
  }, { params: t.Object({ id: t.String() }) })

  .post("/", async ({ body, appUuid, userId }) => {
    const activity = await ActivityService.create({
      ...body,
      performedById: body.performedById || userId || undefined,
      appId: appUuid,
    });
    return { data: activity };
  }, {
    body: t.Object({
      type: t.String(),
      title: t.String(),
      description: t.Optional(t.String()),
      dueDate: t.Optional(t.String()),
      performedById: t.Optional(t.String()),
      customerId: t.Optional(t.String()),
      contactId: t.Optional(t.String()),
      dealId: t.Optional(t.String()),
    }),
  })

  .patch("/:id", async ({ params, body, set }) => {
    try {
      const activity = await ActivityService.update(params.id, body);
      return { data: activity };
    } catch {
      set.status = 404;
      return { error: "Activity not found" };
    }
  }, {
    params: t.Object({ id: t.String() }),
    body: t.Object({
      title: t.Optional(t.String()),
      description: t.Optional(t.String()),
      type: t.Optional(t.String()),
      dueDate: t.Optional(t.String()),
      completedAt: t.Optional(t.String()),
    }),
  })

  .post("/:id/complete", async ({ params, set }) => {
    try {
      const activity = await ActivityService.markComplete(params.id);
      return { data: activity };
    } catch {
      set.status = 404;
      return { error: "Activity not found" };
    }
  }, { params: t.Object({ id: t.String() }) })

  .delete("/:id", async ({ params, set }) => {
    try {
      await ActivityService.delete(params.id);
      return { success: true };
    } catch {
      set.status = 404;
      return { error: "Activity not found" };
    }
  }, { params: t.Object({ id: t.String() }) });
