// =============================================================
// Authenticated App Layout (Phase 4 — nav corrected)
//
// Per builder contract (frontend/NAVIGATION-SCOPE.md + UI-REFERENCE.md):
//
// Auth guard flow:
//   1. Check scalechat_token in localStorage
//   2. syncOrganizationContextFromSession() → GET /api/auth/context
//   3. If not authenticated → redirect /login
//   4. If no org → redirect /onboarding
//   5. isPathAllowedForRole(pathname, role) → redirect /dashboard if blocked
//
// Layout: Sidebar (desktop) + TopBar + <Outlet /> + BottomNav (mobile)
//
// Sidebar per NAVIGATION-SCOPE.md (exact order, exact labels, exact icons):
//   Operasional: Dashboard, Inbox, Handover, Orders
//   Data:        Pelanggan, Products
//   Outreach:    Broadcast
//   Otomasi:     Workflow, AI Agents, AI Playground, Knowledge Base, Settings
//
// Takedown (must NOT appear): Metrics, Analytics, Developers,
//   Apps, Integration, Help, Pipeline
// =============================================================

import {
  createFileRoute,
  Outlet,
  redirect,
  Link,
  useLocation,
} from "@tanstack/react-router";
import { createContext, useContext, useEffect, useState } from "react";
import {
  LayoutDashboard,
  MessagesSquare,
  Users,
  Shuffle,
  ShoppingCart,
  Package,
  Megaphone,
  Network,
  Bot,
  WandSparkles,
  BookOpen,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getToken, logout as apiLogout } from "@/lib/api";
import {
  syncOrganizationContextFromSession,
  getStoredOrgName,
} from "@/lib/organization";
import { isPathAllowedForRole } from "@/lib/role-access";

// ── Route definition ──────────────────────────────────────────

export const Route = createFileRoute("/_app")({
  beforeLoad: async ({ location }) => {
    const token = getToken();
    if (!token) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
    // Full context sync happens in the component via useEffect;
    // beforeLoad only handles the cheap token-missing fast-path.
  },
  component: AppLayout,
});

// ── App context ───────────────────────────────────────────────

interface AppContextValue {
  userId: string | null;
  userName: string | null;
  userRole: string | null;
  orgName: string | null;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
}

const AppCtx = createContext<AppContextValue>({
  userId: null,
  userName: null,
  userRole: null,
  orgName: null,
  sidebarOpen: false,
  toggleSidebar: () => {},
  closeSidebar: () => {},
});

export function useAppContext() {
  return useContext(AppCtx);
}

// ── Layout ────────────────────────────────────────────────────

function AppLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [orgName, setOrgName] = useState<string | null>(getStoredOrgName());

  // On mount: sync session and enforce role-based access
  useEffect(() => {
    (async () => {
      const sync = await syncOrganizationContextFromSession();
      if (!sync.authenticated) {
        window.location.href = "/login";
        return;
      }
      if (!sync.hasOrg) {
        window.location.href = "/onboarding";
        return;
      }
      if (sync.context?.user) {
        setUserId(sync.context.user.id);
        setUserName(sync.context.user.name);
        setUserRole(sync.context.user.role ?? "agent");
        if (sync.context.organization?.name) {
          setOrgName(sync.context.organization.name);
        }
        // Role gate
        const role = sync.context.user.role ?? "agent";
        if (!isPathAllowedForRole(location.pathname, role)) {
          window.location.href = "/dashboard";
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ctx: AppContextValue = {
    userId,
    userName,
    userRole,
    orgName,
    sidebarOpen,
    toggleSidebar: () => setSidebarOpen((v) => !v),
    closeSidebar: () => setSidebarOpen(false),
  };

  return (
    <AppCtx.Provider value={ctx}>
      {/* ocm-shell matches UI-REFERENCE.md .ocm-shell class */}
      <div className="ocm-shell flex h-screen overflow-hidden bg-background text-foreground">

        {/* Desktop sidebar */}
        <div className="hidden lg:flex">
          <AppSidebar />
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-[120] lg:hidden">
            <button
              className="absolute inset-0 bg-black/60"
              onClick={ctx.closeSidebar}
              aria-label="Close menu"
            />
            <div className="relative h-full w-72">
              <AppSidebar />
            </div>
          </div>
        )}

        {/* Main area */}
        <div className="flex min-w-0 flex-1 flex-col bg-background">
          <AppTopBar />
          <div className="relative flex min-h-0 flex-1 overflow-auto pb-16 lg:pb-0">
            <Outlet />
          </div>
          {/* Mobile bottom nav — Phase 5 (realtime-heavy pages need it) */}
        </div>
      </div>
    </AppCtx.Provider>
  );
}

// ── Sidebar ───────────────────────────────────────────────────

// ── Nav items — single source of truth per NAVIGATION-SCOPE.md ──
// Order and labels are contractually fixed. Do not reorder or add items.
// Takedown list (must never appear): Metrics, Analytics, Developers,
// Apps, Integration, Help, Pipeline.
const NAV_GROUPS = [
  {
    label: "Operasional",
    items: [
      { label: "Dashboard",  href: "/dashboard", icon: LayoutDashboard },
      { label: "Inbox",      href: "/chat",      icon: MessagesSquare   },
      { label: "Handover",   href: "/handover",  icon: Shuffle          },
      { label: "Orders",     href: "/orders",    icon: ShoppingCart     },
    ],
  },
  {
    label: "Data",
    items: [
      { label: "Pelanggan", href: "/customers", icon: Users   },
      { label: "Products",  href: "/products",  icon: Package },
    ],
  },
  {
    label: "Outreach",
    items: [
      { label: "Broadcast", href: "/broadcast", icon: Megaphone },
    ],
  },
  {
    label: "Otomasi",
    items: [
      { label: "Workflow",      href: "/flows",     icon: Network       },
      { label: "AI Agents",     href: "/ai-agents", icon: Bot           },
      { label: "AI Playground", href: "/ai",        icon: WandSparkles  },
      { label: "Knowledge Base",href: "/knowledge", icon: BookOpen      },
      { label: "Settings",      href: "/settings",  icon: Settings      },
    ],
  },
];

function AppSidebar() {
  const { orgName, userName, userRole, closeSidebar } = useAppContext();
  const location = useLocation();

  async function handleLogout() {
    await apiLogout();
    window.location.href = "/login";
  }

  return (
    <aside className="flex h-full w-72 flex-col border-r border-border bg-card text-card-foreground">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg bg-primary font-bold text-primary-foreground">
            O
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">OpenCRM</p>
            <p className="truncate text-[11px] text-muted-foreground">
              {orgName ?? "WhatsApp Workspace"}
            </p>
          </div>
        </div>
        {/* Mobile close */}
        <button
          onClick={closeSidebar}
          className="rounded-md p-2 text-muted-foreground hover:bg-muted lg:hidden"
          aria-label="Close sidebar"
        >
          <X size={18} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                // Per NAVIGATION-SCOPE.md: exact match OR prefix match for all items
                const active =
                  location.pathname === item.href ||
                  location.pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={closeSidebar}
                    className={cn(
                      "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary/15 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon size={16} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t border-border p-3">
        <div className="mb-3 flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-3 py-2">
          <UserAvatar name={userName ?? "U"} size={30} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">
              {userName ?? "Agent"}
            </p>
            <p className="truncate text-xs capitalize text-muted-foreground">
              {userRole ?? "agent"}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-500 hover:bg-red-500/15 transition-colors"
        >
          <LogOut size={15} />
          Logout
        </button>
      </div>
    </aside>
  );
}

// ── Top bar ───────────────────────────────────────────────────

function AppTopBar() {
  const { toggleSidebar } = useAppContext();
  const location = useLocation();

  const pageTitle = (() => {
    const seg = location.pathname.split("/").filter(Boolean)[0] ?? "";
    if (!seg) return "Dashboard";
    return seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " ");
  })();

  return (
    <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          onClick={toggleSidebar}
          className="rounded-md p-2 text-muted-foreground hover:bg-muted lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>
        <h2 className="text-sm font-semibold text-foreground">{pageTitle}</h2>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        <button
          className="relative rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Notifications"
        >
          <Bell size={18} />
        </button>
      </div>
    </header>
  );
}

// ── Avatar helper ─────────────────────────────────────────────

// Gradient palette per UI-REFERENCE.md §5 Avatar Component
const AVATAR_PALETTE: [string, string][] = [
  ["#d97706", "#7c2d12"],
  ["#0f766e", "#164e63"],
  ["#9333ea", "#4c1d95"],
  ["#dc2626", "#7f1d1d"],
  ["#0369a1", "#1e3a8a"],
  ["#65a30d", "#3f6212"],
  ["#c026d3", "#701a75"],
];

function UserAvatar({ name, size = 30 }: { name: string; size?: number }) {
  const hash = name
    .split("")
    .reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const [from, to] = AVATAR_PALETTE[hash % AVATAR_PALETTE.length]!;
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${from}, ${to})`,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.38,
        fontWeight: 700,
        color: "#fff",
        flexShrink: 0,
      }}
      aria-label={name}
    >
      {initials}
    </div>
  );
}
