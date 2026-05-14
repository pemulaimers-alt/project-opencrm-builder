// =============================================================
// Deal / CRM Module Routes (Phase 3)
//
// Per API contract:
//   GET   /api/crm/pipelines     — list deals (pipeline view)
//   GET   /api/crm/deals/:id     — get deal detail
//   POST  /api/crm/pipelines     — create deal
//   PATCH /api/crm/deals/:id     — update deal
//   DELETE /api/crm/pipelines/:id — delete deal
// =============================================================

import { Elysia, t } from "elysia";
import { DealService } from "./service";

export const dealModule = new Elysia({ name: "module:deal", prefix: "/crm" })

  .get("/pipelines", async ({ appUuid, query }) => {
    const deals = await DealService.list(appUuid, {
      stage: query.stage || undefined,
      assigneeId: query.assigneeId || undefined,
    });
    return { data: deals };
  }, { query: t.Object({ appId: t.Optional(t.String()), stage: t.Optional(t.String()), assigneeId: t.Optional(t.String()) }) })

  .get("/deals/:conversationId", async ({ params, set }) => {
    const deal = await DealService.getById(params.conversationId);
    if (!deal) {
      set.status = 404;
      return { error: "Deal not found" };
    }
    return { data: deal };
  }, { params: t.Object({ conversationId: t.String() }) })

  .post("/pipelines", async ({ body, appUuid }) => {
    const deal = await DealService.create({ ...body, appId: appUuid });
    return { data: deal };
  }, {
    body: t.Object({
      title: t.String(),
      value: t.Optional(t.Number()),
      currency: t.Optional(t.String()),
      stage: t.Optional(t.String()),
      priority: t.Optional(t.String()),
      expectedCloseDate: t.Optional(t.String()),
      notes: t.Optional(t.String()),
      customerId: t.String(),
      assigneeId: t.Optional(t.String()),
    }),
  })

  .patch("/deals/:conversationId", async ({ params, body, set }) => {
    try {
      const deal = await DealService.update(params.conversationId, body);
      return { data: deal };
    } catch {
      set.status = 404;
      return { error: "Deal not found" };
    }
  }, {
    params: t.Object({ conversationId: t.String() }),
    body: t.Object({
      title: t.Optional(t.String()),
      value: t.Optional(t.Number()),
      currency: t.Optional(t.String()),
      stage: t.Optional(t.String()),
      priority: t.Optional(t.String()),
      expectedCloseDate: t.Optional(t.String()),
      notes: t.Optional(t.String()),
      assigneeId: t.Optional(t.String()),
      pipeline_id: t.Optional(t.String()),
      stage_id: t.Optional(t.String()),
      deal_value: t.Optional(t.Number()),
    }),
  })

  .delete("/pipelines/:id", async ({ params, set }) => {
    try {
      await DealService.delete(params.id);
      return { success: true };
    } catch {
      set.status = 404;
      return { error: "Deal not found" };
    }
  }, { params: t.Object({ id: t.String() }) });
