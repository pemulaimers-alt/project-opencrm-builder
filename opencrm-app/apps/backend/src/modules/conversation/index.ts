// =============================================================
// Conversation Module Routes (Phase 6A)
//
// Per API contract (subset implemented):
//   GET    /api/conversations/            — list (paginated, filterable)
//   GET    /api/conversations/:id         — get by id
//   POST   /api/conversations/            — create
//   PATCH  /api/conversations/:id/status  — update status
//   GET    /api/conversations/:id/messages — fetch messages
//   POST   /api/conversations/:id/messages — send message
// =============================================================

import { Elysia, t } from "elysia";
import { requireAuth } from "../../plugins/require-auth";
import { ConversationService } from "./service";

export const conversationModule = new Elysia({ name: "module:conversation", prefix: "/conversations" })
  .use(requireAuth)

  // List conversations
  .get("/", async ({ appUuid, query }) => {
    const result = await ConversationService.list(appUuid, {
      status:     query.status      || undefined,
      customerId: query.customerId  || undefined,
      page:       query.page        ? Number(query.page)  : undefined,
      limit:      query.limit       ? Number(query.limit) : undefined,
    });
    return { data: result.data, total: result.total, page: result.page, limit: result.limit };
  }, {
    query: t.Object({
      status:     t.Optional(t.String()),
      customerId: t.Optional(t.String()),
      page:       t.Optional(t.String()),
      limit:      t.Optional(t.String()),
    }),
  })

  // Get single conversation
  .get("/:id", async ({ params, set }) => {
    const conv = await ConversationService.getById(params.id);
    if (!conv) {
      set.status = 404;
      return { error: "Conversation not found" };
    }
    return { data: conv };
  }, { params: t.Object({ id: t.String() }) })

  // Create conversation
  .post("/", async ({ body, appUuid, userId }) => {
    const conv = await ConversationService.create({
      subject:    body.subject,
      notes:      body.notes,
      customerId: body.customerId,
      assigneeId: body.assigneeId ?? userId ?? undefined,
      appId:      appUuid,
    });
    return { data: conv };
  }, {
    body: t.Object({
      subject:    t.Optional(t.String()),
      notes:      t.Optional(t.String()),
      customerId: t.Optional(t.String()),
      assigneeId: t.Optional(t.String()),
    }),
  })

  // Update status
  .patch("/:id/status", async ({ params, body, set }) => {
    try {
      const conv = await ConversationService.updateStatus(params.id, body.status);
      return { data: conv };
    } catch {
      set.status = 404;
      return { error: "Conversation not found" };
    }
  }, {
    params: t.Object({ id: t.String() }),
    body:   t.Object({ status: t.String() }),
  })

  // Also accept POST for status (per contract)
  .post("/:id/status", async ({ params, body, set }) => {
    try {
      const conv = await ConversationService.updateStatus(params.id, body.status);
      return { data: conv };
    } catch {
      set.status = 404;
      return { error: "Conversation not found" };
    }
  }, {
    params: t.Object({ id: t.String() }),
    body:   t.Object({ status: t.String() }),
  })

  // Resolve shortcut
  .post("/:id/resolve", async ({ params, set }) => {
    try {
      const conv = await ConversationService.updateStatus(params.id, "resolved");
      return { data: conv };
    } catch {
      set.status = 404;
      return { error: "Conversation not found" };
    }
  }, { params: t.Object({ id: t.String() }) })

  // Get messages in conversation
  .get("/:id/messages", async ({ params, query }) => {
    const messages = await ConversationService.getMessages(params.id, {
      limit:  query.limit  ? Number(query.limit) : undefined,
      before: query.before || undefined,
    });
    return { data: messages };
  }, {
    params: t.Object({ id: t.String() }),
    query:  t.Object({ limit: t.Optional(t.String()), before: t.Optional(t.String()) }),
  })

  // Send message in conversation
  .post("/:id/messages", async ({ params, body, appUuid, userId, set }) => {
    if (!body.content?.trim()) {
      set.status = 400;
      return { error: "Message content is required" };
    }
    const msg = await ConversationService.sendMessage({
      conversationId: params.id,
      content:        String(body.content),
      senderId:       userId ?? undefined,
      senderType:     body.sender_type ?? "agent",
      appId:          appUuid,
    });
    return { data: msg };
  }, {
    params: t.Object({ id: t.String() }),
    body:   t.Object({
      content:     t.Any(),
      sender_type: t.Optional(t.String()),
      senderId:    t.Optional(t.String()),
    }),
  });
