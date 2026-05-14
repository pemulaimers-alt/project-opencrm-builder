// =============================================================
// Customer Service (Phase 3)
// =============================================================

import { prisma } from "../../lib/prisma";

export class CustomerService {
  static async list(appId: string | null, query?: { page?: number; limit?: number; search?: string }) {
    const page = query?.page ?? 1;
    const limit = query?.limit ?? 25;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (appId) where.appId = appId;
    if (query?.search) {
      where.OR = [
        { name: { contains: query.search, mode: "insensitive" } },
        { email: { contains: query.search, mode: "insensitive" } },
        { company: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { contacts: true, deals: true } } },
      }),
      prisma.customer.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  static async getById(id: string) {
    return prisma.customer.findUnique({
      where: { id },
      include: {
        contacts: true,
        deals: { orderBy: { createdAt: "desc" } },
      },
    });
  }

  static async create(data: {
    name: string;
    email?: string;
    phone?: string;
    company?: string;
    industry?: string;
    website?: string;
    address?: string;
    notes?: string;
    appId?: string | null;
  }) {
    return prisma.customer.create({ data: { ...data, appId: data.appId ?? null } });
  }

  static async update(id: string, data: Partial<{
    name: string;
    email: string;
    phone: string;
    company: string;
    industry: string;
    website: string;
    address: string;
    notes: string;
  }>) {
    return prisma.customer.update({ where: { id }, data });
  }

  static async delete(id: string) {
    await prisma.customer.delete({ where: { id } });
  }
}
