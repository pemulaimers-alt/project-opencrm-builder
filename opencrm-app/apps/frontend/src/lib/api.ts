// =============================================================
// API client (Phase 4)
//
// Thin typed wrapper around fetch.
// Per builder contract (shared/TYPES.md + PAGE-API-MAP.md):
//   - Auth headers: Authorization Bearer, X-Org-Slug, X-App-Id
//   - Token stored in localStorage under 'scalechat_token'
//   - On 401 → clear token → redirect /login
// =============================================================

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3010";
const AUTH_BASE = `${API_URL}/auth`;

// ── Token helpers ──────────────────────────────────────────────

export function getToken(): string | null {
  if (typeof localStorage === "undefined") return null;
  return localStorage.getItem("scalechat_token");
}

export function setToken(token: string): void {
  localStorage.setItem("scalechat_token", token);
}

export function clearToken(): void {
  localStorage.removeItem("scalechat_token");
}

// ── Request builder ────────────────────────────────────────────

interface RequestOptions extends RequestInit {
  json?: unknown;
}

export async function apiRequest<T = unknown>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const token = getToken();
  const orgSlug = localStorage.getItem("scalechat_org_slug") ?? undefined;
  const appId = localStorage.getItem("scalechat_app_id") ?? undefined;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };

  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (orgSlug) headers["X-Org-Slug"] = orgSlug;
  if (appId) headers["X-App-Id"] = appId;

  const body = options.json !== undefined ? JSON.stringify(options.json) : options.body;

  const url = path.startsWith("http") ? path : `${API_URL}${path}`;

  const res = await fetch(url, {
    ...options,
    headers,
    body,
    credentials: "include",
  });

  if (res.status === 401) {
    clearToken();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    throw new Error(
      (payload as { error?: string; message?: string }).error ??
        (payload as { message?: string }).message ??
        `HTTP ${res.status}`
    );
  }

  return res.json() as Promise<T>;
}

// ── Auth endpoints ─────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role?: string;
  avatarUrl?: string;
  appId?: string;
}

export interface SignInResponse {
  user: AuthUser;
  token?: string;
}

/** POST /auth/sign-in/email — Better Auth root surface */
export async function signIn(email: string, password: string): Promise<SignInResponse> {
  const res = await fetch(`${AUTH_BASE}/sign-in/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { error?: { message?: string }; message?: string }).error?.message ??
        (err as { message?: string }).message ??
        "Invalid credentials"
    );
  }
  return res.json();
}

/** POST /auth/sign-up/email — Better Auth root surface */
export async function signUp(
  email: string,
  password: string,
  name: string
): Promise<SignInResponse> {
  const res = await fetch(`${AUTH_BASE}/sign-up/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name }),
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { error?: { message?: string }; message?: string }).error?.message ??
        (err as { message?: string }).message ??
        "Registration failed"
    );
  }
  return res.json();
}

// ── Authority endpoints (/api/auth/*) ─────────────────────────

export interface ContextResponse {
  user: AuthUser | null;
  organization: {
    id: string;
    name: string;
    slug: string;
    logo?: string;
    appId?: string;
  } | null;
  appId: string | null;
}

/** GET /api/auth/context — session + org context */
export async function getAuthContext(): Promise<ContextResponse> {
  const data = await apiRequest<{ success: boolean; data: ContextResponse }>(
    "/api/auth/context"
  );
  return data.data;
}

/** POST /api/auth/onboarding — create organization for current user */
export async function postOnboarding(
  companyName: string,
  slug?: string
): Promise<{ organization: { id: string; name: string; slug: string }; app: { id: string; appId: string } }> {
  const data = await apiRequest<{
    success: boolean;
    data: { organization: { id: string; name: string; slug: string }; app: { id: string; appId: string } };
  }>("/api/auth/onboarding", {
    method: "POST",
    json: { companyName, slug },
  });
  return data.data;
}

/** GET /api/auth/me — current user profile */
export async function getMe(): Promise<AuthUser> {
  const data = await apiRequest<{ success: boolean; data: AuthUser }>("/api/auth/me");
  return data.data;
}

/** POST /api/auth/logout */
export async function logout(): Promise<void> {
  await apiRequest("/api/auth/logout", { method: "POST" }).catch(() => {});
  clearToken();
}
