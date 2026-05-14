// =============================================================
// Role-based path access guard (Phase 4)
//
// Per builder contract (frontend/blueprint.md role-access.ts):
//   agent      → /dashboard, /chat, /channels/whatsapp
//   supervisor → agent paths + /team, /orders, /products,
//                /product-stock, /settings
//   admin/owner → all paths (unrestricted)
// =============================================================

const AGENT_PATHS = ["/dashboard", "/chat", "/channels/whatsapp"];

const SUPERVISOR_PATHS = [
  ...AGENT_PATHS,
  "/team",
  "/orders",
  "/products",
  "/product-stock",
  "/settings",
];

/**
 * Returns true if the given role is allowed to access the path.
 * admin and owner are unrestricted.
 * Unknown roles fall back to agent-level access.
 */
export function isPathAllowedForRole(pathname: string, role: string | undefined | null): boolean {
  const r = (role ?? "agent").toLowerCase();

  if (r === "admin" || r === "owner") return true;

  const allowed = r === "supervisor" ? SUPERVISOR_PATHS : AGENT_PATHS;

  // Exact or prefix match
  return allowed.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

/**
 * Returns the default landing path for a given role.
 */
export function defaultPathForRole(role: string | undefined | null): string {
  return "/dashboard";
}
