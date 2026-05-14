// =============================================================
// Team Service (Phase 3)
// =============================================================

import { prisma } from "../../lib/prisma";

export class TeamService {
  static async list(appId: string | null) {
    return prisma.team.findMany({
      where: appId ? { appId } : undefined,
      include: {
        users: { select: { id: true, name: true, email: true, role: true, active: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getById(id: string) {
    return prisma.team.findUnique({
      where: { id },
      include: {
        users: { select: { id: true, name: true, email: true, role: true, active: true } },
      },
    });
  }

  static async create(data: { name: string; description?: string; appId?: string | null }) {
    return prisma.team.create({
      data: {
        name: data.name,
        description: data.description,
        appId: data.appId ?? null,
      },
    });
  }

  static async update(id: string, data: { name?: string; description?: string }) {
    return prisma.team.update({
      where: { id },
      data,
    });
  }

  static async delete(id: string) {
    await prisma.team.delete({ where: { id } });
  }

  static async addMember(teamId: string, userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { teamId },
      select: { id: true, name: true, email: true, teamId: true },
    });
  }

  static async removeMember(teamId: string, userId: string) {
    return prisma.user.update({
      where: { id: userId, teamId },
      data: { teamId: null },
      select: { id: true, name: true, email: true, teamId: true },
    });
  }
}
