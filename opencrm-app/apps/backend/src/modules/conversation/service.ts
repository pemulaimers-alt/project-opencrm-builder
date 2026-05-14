// =============================================================
// Conversation Service (Phase 6A)
// =============================================================

import { prisma } from "../../lib/prisma";

export class ConversationService {
  static async list(appId: string | null, query?: {
    status?: string;
    customerId?: string;
    assigneeId?: string;
    page?: number;
    limit?: number;
  }) {
    const page  = query?.page  ?? 1;
    const limit = query?.limit ?? 25;
    const skip  = (page - 1) * limit;

    const where: any = {};
    if (appId)              where.appId      = appId;
    if (query?.status)      where.status     = query.status;
    if (query?.customerId)  where.customerId = query.customerId;
    if (query?.assigneeId)  where.assigneeId = query.assigneeId;

    const [data, total] = await Promise.all([
      prisma.conversation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: "desc" },
        include: {
          customer:  { select: { id: true, name: true, company: true } },
          assignee:  { select: { id: true, name: true, avatarUrl: true } },
          messages:  {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { id: true, content: true, createdAt: true, senderType: true },
          },
          _count: { select: { messages: true } },
        },
      }),
      prisma.conversation.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  static async getById(id: string) {
    return prisma.conversation.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, name: true, company: true, email: true, phone: true } },
        assignee: { select: { id: true, name: true, avatarUrl: true, role: true } },
        _count:   { select: { messages: true } },
      },
    });
  }

  static async create(data: {
    subject?: string;
    notes?: string;
    customerId?: string;
    assigneeId?: string;
    appId?: string | null;
  }) {
    return prisma.conversation.create({
      data: {
        subject:    data.subject,
        notes:      data.notes,
        status:     "open",
        customerId: data.customerId,
        assigneeId: data.assigneeId,
        appId:      data.appId ?? null,
      },
    });
  }

  static async updateStatus(id: string, status: string) {
    return prisma.conversation.update({
      where: { id },
      data:  { status },
    });
  }

  static async getMessages(conversationId: string, query?: {
    limit?: number;
    before?: string;
  }) {
    const limit = query?.limit ?? 50;
    const where: any = { conversationId };
    if (query?.before) {
      where.createdAt = { lt: new Date(query.before) };
    }

    return prisma.message.findMany({
      where,
      orderBy: { createdAt: "asc" },
      take: limit,
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true, role: true } },
      },
    });
  }

  static async sendMessage(data: {
    conversationId: string;
    content: string;
    senderId?: string;
    senderType?: string;
    appId?: string | null;
  }) {
    const [msg] = await prisma.$transaction([
      prisma.message.create({
        data: {
          conversationId: data.conversationId,
          content:        data.content,
          senderType:     data.senderType ?? "agent",
          senderId:       data.senderId,
          appId:          data.appId ?? null,
        },
        include: {
          sender: { select: { id: true, name: true, avatarUrl: true, role: true } },
        },
      }),
      // Bump conversation updatedAt so list re-sorts correctly
      prisma.conversation.update({
        where: { id: data.conversationId },
        data:  { updatedAt: new Date() },
      }),
    ]);
    return msg;
  }
}
