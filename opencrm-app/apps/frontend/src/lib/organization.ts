// =============================================================
// Organization / app / workspace context helpers (Phase 4)
//
// Per builder contract (shared/TYPES.md, frontend/blueprint.md):
//   Cookie + localStorage keys:
//     scalechat_org_slug   — current org slug  (X-Org-Slug header)
//     scalechat_app_id     — current app uuid  (X-App-Id header)
//     scalechat_org_id     — current org id    (UI display)
//     scalechat_token      — session token     (Authorization header)
//
// syncOrganizationContextFromSession():
//   Called after login and on every _app.tsx mount.
//   Hits GET /api/auth/context → writes context to storage.
// =============================================================

import { getAuthContext, type ContextResponse } from "./api";

const KEYS = {
  token: "scalechat_token",
  orgSlug: "scalechat_org_slug",
  appId: "scalechat_app_id",
  orgId: "scalechat_org_id",
  orgName: "scalechat_org_name",
} as const;

// ── Read helpers ───────────────────────────────────────────────

export function getStoredOrgSlug(): string | null {
  return localStorage.getItem(KEYS.orgSlug);
}

export function getStoredAppId(): string | null {
  return localStorage.getItem(KEYS.appId);
}

export function getStoredOrgName(): string | null {
  return localStorage.getItem(KEYS.orgName);
}

// ── Write helpers ──────────────────────────────────────────────

export function persistOrgContext(ctx: ContextResponse): void {
  if (ctx.organization) {
    localStorage.setItem(KEYS.orgSlug, ctx.organization.slug);
    localStorage.setItem(KEYS.orgId, ctx.organization.id);
    localStorage.setItem(KEYS.orgName, ctx.organization.name);
    if (ctx.organization.appId) {
      localStorage.setItem(KEYS.appId, ctx.organization.appId);
    }
  }
  if (ctx.appId) {
    localStorage.setItem(KEYS.appId, ctx.appId);
  }
}

export function clearOrgContext(): void {
  localStorage.removeItem(KEYS.orgSlug);
  localStorage.removeItem(KEYS.appId);
  localStorage.removeItem(KEYS.orgId);
  localStorage.removeItem(KEYS.orgName);
}

// ── Sync ───────────────────────────────────────────────────────

export interface SyncResult {
  authenticated: boolean;
  hasOrg: boolean;
  context: ContextResponse | null;
}

/**
 * Fetch /api/auth/context and persist org/app into localStorage.
 * Returns whether the user is authenticated and has an org.
 * Call this after login and on every app shell mount.
 */
export async function syncOrganizationContextFromSession(): Promise<SyncResult> {
  try {
    const ctx = await getAuthContext();
    if (!ctx.user) {
      return { authenticated: false, hasOrg: false, context: null };
    }
    persistOrgContext(ctx);
    return {
      authenticated: true,
      hasOrg: Boolean(ctx.organization),
      context: ctx,
    };
  } catch {
    return { authenticated: false, hasOrg: false, context: null };
  }
}
