// =============================================================
// Contact Service (Phase 3)
// =============================================================

import { prisma } from "../../lib/prisma";

export class ContactService {
  static async list(appId: string | null, query?: { q?: string }) {
    const where: any = {};
    if (appId) where.appId = appId;
    if (query?.q) {
      where.OR = [
        { firstName: { contains: query.q, mode: "insensitive" } },
        { lastName: { contains: query.q, mode: "insensitive" } },
        { email: { contains: query.q, mode: "insensitive" } },
        { phone: { contains: query.q, mode: "insensitive" } },
      ];
    }

    return prisma.contact.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { customer: { select: { id: true, name: true } } },
    });
  }

  static async getById(id: string) {
    return prisma.contact.findUnique({
      where: { id },
      include: { customer: { select: { id: true, name: true, company: true } } },
    });
  }

  static async create(data: {
    firstName: string;
    lastName?: string;
    email?: string;
    phone?: string;
    jobTitle?: string;
    isPrimary?: boolean;
    customerId: string;
    appId?: string | null;
  }) {
    return prisma.contact.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        jobTitle: data.jobTitle,
        isPrimary: data.isPrimary ?? false,
        customerId: data.customerId,
        appId: data.appId ?? null,
      },
    });
  }

  static async update(id: string, data: Partial<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    jobTitle: string;
    isPrimary: boolean;
  }>) {
    return prisma.contact.update({ where: { id }, data });
  }

  static async delete(id: string) {
    await prisma.contact.delete({ where: { id } });
  }
}
