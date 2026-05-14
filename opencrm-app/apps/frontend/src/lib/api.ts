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

// ── Customer endpoints (/api/customers/*) ─────────────────────

export interface Customer {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  industry?: string | null;
  website?: string | null;
  address?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { contacts: number; deals: number };
}

export interface ContactSummary {
  id: string;
  firstName: string;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  jobTitle?: string | null;
  isPrimary: boolean;
  createdAt: string;
}

export interface DealSummary {
  id: string;
  title: string;
  value?: string | null;
  currency: string;
  stage: string;
  priority: string;
  closedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerDetail extends Customer {
  contacts: ContactSummary[];
  deals: DealSummary[];
}

export interface CustomerListResponse {
  data: Customer[];
  total: number;
  page: number;
  limit: number;
}

/** GET /api/customers/ — paginated customer list */
export async function listCustomers(params?: {
  page?: number;
  per_page?: number;
  search?: string;
}): Promise<CustomerListResponse> {
  const q = new URLSearchParams();
  if (params?.page)     q.set("page", String(params.page));
  if (params?.per_page) q.set("per_page", String(params.per_page));
  if (params?.search)   q.set("q", params.search);
  const qs = q.toString() ? `?${q}` : "";
  return apiRequest<CustomerListResponse>(`/api/customers/${qs}`);
}

/** GET /api/customers/:id — customer detail with contacts + deals */
export async function getCustomer(id: string): Promise<{ data: CustomerDetail }> {
  return apiRequest<{ data: CustomerDetail }>(`/api/customers/${id}`);
}

/** POST /api/customers/ — create customer */
export async function createCustomer(body: {
  name: string; email?: string; phone?: string; company?: string;
  industry?: string; website?: string; address?: string; notes?: string;
}): Promise<{ data: Customer }> {
  return apiRequest<{ data: Customer }>("/api/customers/", { method: "POST", json: body });
}

/** PUT /api/customers/:id — update customer */
export async function updateCustomer(id: string, body: Partial<{
  name: string; email: string; phone: string; company: string;
  industry: string; website: string; address: string; notes: string;
}>): Promise<{ data: Customer }> {
  return apiRequest<{ data: Customer }>(`/api/customers/${id}`, { method: "PUT", json: body });
}

/** DELETE /api/customers/:id */
export async function deleteCustomer(id: string): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>(`/api/customers/${id}`, { method: "DELETE" });
}

// ── Team endpoints (/api/teams/*) ─────────────────────────────

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role?: string | null;
  active?: boolean | null;
}

export interface Team {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  users?: TeamMember[];
}

/** GET /api/teams/ — list teams with members */
export async function listTeams(): Promise<Team[]> {
  const data = await apiRequest<{ success: boolean; payload: Team[] }>("/api/teams/");
  return data.payload ?? [];
}

/** POST /api/teams/ — create team */
export async function createTeam(body: { name: string; description?: string }): Promise<{ success: boolean; payload: Team }> {
  return apiRequest<{ success: boolean; payload: Team }>("/api/teams/", { method: "POST", json: body });
}

/** PATCH /api/teams/:id — update team */
export async function updateTeam(id: string, body: { name?: string; description?: string }): Promise<{ success: boolean; payload: Team }> {
  return apiRequest<{ success: boolean; payload: Team }>(`/api/teams/${id}`, { method: "PATCH", json: body });
}

/** DELETE /api/teams/:id */
export async function deleteTeam(id: string): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>(`/api/teams/${id}`, { method: "DELETE" });
}

/** POST /api/teams/:id/members */
export async function addTeamMember(teamId: string, userId: string): Promise<{ success: boolean; payload: TeamMember }> {
  return apiRequest<{ success: boolean; payload: TeamMember }>(
    `/api/teams/${teamId}/members`, { method: "POST", json: { userId } }
  );
}

/** DELETE /api/teams/:id/members/:userId */
export async function removeTeamMember(teamId: string, userId: string): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>(`/api/teams/${teamId}/members/${userId}`, { method: "DELETE" });
}

// ── User endpoints (/api/user/*) ──────────────────────────────

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role?: string | null;
  avatarUrl?: string | null;
  phoneNumber?: string | null;
  timezone?: string | null;
  active?: boolean | null;
  teamId?: string | null;
  appId?: string | null;
  createdAt: string;
  updatedAt: string;
}

/** GET /api/user/:id — get user profile */
export async function getUserProfile(id: string): Promise<{ data: UserProfile }> {
  return apiRequest<{ data: UserProfile }>(`/api/user/${id}`);
}

/** PATCH /api/user/:id — update user profile */
export async function updateUserProfile(id: string, body: {
  name?: string; avatar_url?: string; phone?: string;
}): Promise<{ data: UserProfile }> {
  return apiRequest<{ data: UserProfile }>(`/api/user/${id}`, { method: "PATCH", json: body });
}
