// =============================================================
// User Service (Phase 3)
// =============================================================

import { prisma } from "../../lib/prisma";

export class UserService {
  static async list(appId: string | null) {
    return prisma.user.findMany({
      where: appId ? { appId } : undefined,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        phoneNumber: true,
        active: true,
        teamId: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        phoneNumber: true,
        timezone: true,
        active: true,
        teamId: true,
        appId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  static async update(id: string, data: { name?: string; avatar_url?: string; phone?: string }) {
    return prisma.user.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.avatar_url !== undefined && { avatarUrl: data.avatar_url }),
        ...(data.phone !== undefined && { phoneNumber: data.phone }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        phoneNumber: true,
        updatedAt: true,
      },
    });
  }
}
