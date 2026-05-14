// =============================================================
// Auth Service (Phase 3 — Step 1)
// =============================================================

import { auth } from "../../auth";
import { prisma } from "../../lib/prisma";

export class AuthService {
  /**
   * Legacy login — POST /api/auth/login
   *
   * Proxies the request through Better Auth's signInEmail handler
   * so session creation, password hashing, and token issuance are
   * all owned by Better Auth. We never touch the session table directly.
   *
   * Returns the same { user, token } shape the frontend expects, or
   * an error if credentials are invalid.
   */
  static async login(email: string, password: string) {
    const response = await auth.api.signInEmail({
      body: { email, password },
    });

    if (!response) {
      return { success: false as const, error: "Invalid credentials" };
    }

    return {
      success: true as const,
      data: {
        user: response.user,
        token: response.token,
      },
    };
  }

  /**
   * Get session + org context for the current authenticated user.
   */
  static async getContext(userId: string, appUuid: string | null, orgSlug: string | null) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        appId: true,
      },
    });

    let organization = null;
    if (orgSlug) {
      organization = await prisma.organization.findUnique({
        where: { slug: orgSlug },
        select: { id: true, name: true, slug: true, logo: true, appId: true },
      });
    } else if (appUuid) {
      organization = await prisma.organization.findFirst({
        where: { appId: appUuid },
        select: { id: true, name: true, slug: true, logo: true, appId: true },
      });
    }

    return { user, organization, appId: appUuid };
  }

  /**
   * Onboarding — create organization + linked app for the user.
   */
  static async onboarding(userId: string, companyName: string, slug?: string) {
    const orgSlug = slug || companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    // Check slug uniqueness
    const existing = await prisma.organization.findUnique({ where: { slug: orgSlug } });
    if (existing) {
      return { success: false as const, error: "Organization slug already exists" };
    }

    // Create the app (tenant root)
    const app = await prisma.app.create({
      data: {
        appId: orgSlug,
        appName: companyName,
        isActive: true,
      },
    });

    // Create organization linked to app
    const org = await prisma.organization.create({
      data: {
        name: companyName,
        slug: orgSlug,
        createdBy: userId,
        appId: app.id,
      },
    });

    // Add the user as owner member
    await prisma.member.create({
      data: {
        organizationId: org.id,
        userId,
        role: "owner",
      },
    });

    // Link user to this app
    await prisma.user.update({
      where: { id: userId },
      data: { appId: app.id },
    });

    return {
      success: true as const,
      data: { organization: org, app: { id: app.id, appId: app.appId } },
    };
  }

  /**
   * Get current user profile.
   */
  static async getMe(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        phoneNumber: true,
        timezone: true,
        appId: true,
        createdAt: true,
      },
    });
  }
}
