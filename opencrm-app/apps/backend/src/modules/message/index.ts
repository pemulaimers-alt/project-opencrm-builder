// =============================================================
// Message Module Routes (Phase 6A)
//
// Per API contract:
//   POST /api/messages/      — create message (cross-conversation shortcut)
//   GET  /api/messages/:id   — get single message
// =============================================================

import { Elysia, t } from "elysia";
import { requireAuth } from "../../plugins/require-auth";
import { ConversationService } from "../conversation/service";
import { prisma } from "../../lib/prisma";

export const messageModule = new Elysia({ name: "module:message", prefix: "/messages" })
  .use(requireAuth)

  // Create message (contract-compatible shortcut)
  .post("/", async ({ body, appUuid, userId, set }) => {
    if (!body.content?.trim()) {
      set.status = 400;
      return { error: "Message content is required" };
    }
    if (!body.conversationId) {
      set.status = 400;
      return { error: "conversationId is required" };
    }
    const msg = await ConversationService.sendMessage({
      conversationId: body.conversationId,
      content:        body.content,
      senderId:       userId ?? undefined,
      senderType:     "agent",
      appId:          appUuid,
    });
    return { data: msg };
  }, {
    body: t.Object({
      conversationId: t.String(),
      content:        t.String(),
      contentType:    t.Optional(t.String()),
    }),
  })

  // Get single message
  .get("/:id", async ({ params, set }) => {
    const msg = await prisma.message.findUnique({
      where: { id: params.id },
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true } },
      },
    });
    if (!msg) {
      set.status = 404;
      return { error: "Message not found" };
    }
    return { data: msg };
  }, { params: t.Object({ id: t.String() }) });
