// =============================================================
// Deal / CRM Pipeline Service (Phase 3)
// =============================================================

import { prisma } from "../../lib/prisma";

export class DealService {
  static async list(appId: string | null, query?: { stage?: string; assigneeId?: string }) {
    const where: any = {};
    if (appId) where.appId = appId;
    if (query?.stage) where.stage = query.stage;
    if (query?.assigneeId) where.assigneeId = query.assigneeId;

    return prisma.deal.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true } },
      },
    });
  }

  static async getById(id: string) {
    return prisma.deal.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, name: true, company: true } },
        assignee: { select: { id: true, name: true, email: true } },
        activities: { orderBy: { createdAt: "desc" }, take: 10 },
      },
    });
  }

  static async create(data: {
    title: string;
    value?: number;
    currency?: string;
    stage?: string;
    priority?: string;
    expectedCloseDate?: string;
    notes?: string;
    customerId: string;
    assigneeId?: string;
    appId?: string | null;
  }) {
    return prisma.deal.create({
      data: {
        title: data.title,
        value: data.value,
        currency: data.currency,
        stage: data.stage ?? "lead",
        priority: data.priority ?? "medium",
        expectedCloseDate: data.expectedCloseDate ? new Date(data.expectedCloseDate) : null,
        notes: data.notes,
        customerId: data.customerId,
        assigneeId: data.assigneeId,
        appId: data.appId ?? null,
      },
    });
  }

  static async update(id: string, data: Partial<{
    title: string;
    value: number;
    currency: string;
    stage: string;
    priority: string;
    expectedCloseDate: string;
    notes: string;
    assigneeId: string;
  }>) {
    const updateData: any = { ...data };
    if (data.expectedCloseDate) {
      updateData.expectedCloseDate = new Date(data.expectedCloseDate);
    }
    // Set closedAt when stage transitions to won/lost
    if (data.stage === "won" || data.stage === "lost") {
      updateData.closedAt = new Date();
    }
    return prisma.deal.update({ where: { id }, data: updateData });
  }

  static async delete(id: string) {
    await prisma.deal.delete({ where: { id } });
  }
}
