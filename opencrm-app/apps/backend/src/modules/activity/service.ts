// =============================================================
// Activity Service (Phase 3)
// =============================================================

import { prisma } from "../../lib/prisma";

export class ActivityService {
  static async list(appId: string | null, query?: { customerId?: string; dealId?: string; contactId?: string; type?: string }) {
    const where: any = {};
    if (appId) where.appId = appId;
    if (query?.customerId) where.customerId = query.customerId;
    if (query?.dealId) where.dealId = query.dealId;
    if (query?.contactId) where.contactId = query.contactId;
    if (query?.type) where.type = query.type;

    return prisma.activity.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        performedBy: { select: { id: true, name: true } },
        customer: { select: { id: true, name: true } },
        contact: { select: { id: true, firstName: true, lastName: true } },
        deal: { select: { id: true, title: true } },
      },
    });
  }

  static async getById(id: string) {
    return prisma.activity.findUnique({
      where: { id },
      include: {
        performedBy: { select: { id: true, name: true } },
        customer: { select: { id: true, name: true } },
        contact: { select: { id: true, firstName: true, lastName: true } },
        deal: { select: { id: true, title: true } },
      },
    });
  }

  static async create(data: {
    type: string;
    title: string;
    description?: string;
    dueDate?: string;
    performedById?: string;
    customerId?: string;
    contactId?: string;
    dealId?: string;
    appId?: string | null;
  }) {
    return prisma.activity.create({
      data: {
        type: data.type,
        title: data.title,
        description: data.description,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        performedById: data.performedById,
        customerId: data.customerId,
        contactId: data.contactId,
        dealId: data.dealId,
        appId: data.appId ?? null,
      },
    });
  }

  static async update(id: string, data: Partial<{
    title: string;
    description: string;
    type: string;
    dueDate: string;
    completedAt: string;
  }>) {
    const updateData: any = { ...data };
    if (data.dueDate) updateData.dueDate = new Date(data.dueDate);
    if (data.completedAt) updateData.completedAt = new Date(data.completedAt);
    return prisma.activity.update({ where: { id }, data: updateData });
  }

  static async delete(id: string) {
    await prisma.activity.delete({ where: { id } });
  }

  static async markComplete(id: string) {
    return prisma.activity.update({
      where: { id },
      data: { completedAt: new Date() },
    });
  }
}
