// =============================================================
// Authenticated App Layout (Phase 1 — shell placeholder)
//
// This is the parent layout for all protected routes.
// Every route under _app/ inherits this layout.
//
// Phase 1: renders a minimal but realistic shell structure —
//   sidebar placeholder, top bar placeholder, and <Outlet />.
//   Auth guard is wired with a TODO stub.
//
// Phase 3: replace the auth stub with a real session check,
//   add organization context, role-based access control,
//   and fully implement Sidebar + TopBar components.
// =============================================================

import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app")({
  // Auth guard — Phase 3 will replace this with real session validation
  beforeLoad: () => {
    const token =
      typeof localStorage !== "undefined"
        ? localStorage.getItem("scalechat_token")
        : null;

    if (!token) {
      throw redirect({ to: "/login" });
    }
  },
  component: AppLayout,
});

function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar — Phase 3: replace with full <Sidebar /> component */}
      <AppSidebar />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar — Phase 3: replace with full <TopBar /> component */}
        <AppTopBar />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Sidebar placeholder
// ------------------------------------------------------------------
const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: "▤" },
  { label: "Inbox", href: "/chat", icon: "✉" },
  { label: "Customers", href: "/customers", icon: "👥" },
  { label: "Pipeline", href: "/pipeline", icon: "⬡" },
  { label: "Settings", href: "/settings", icon: "⚙" },
];

function AppSidebar() {
  const currentPath =
    typeof window !== "undefined" ? window.location.pathname : "";

  return (
    <aside className="flex h-full w-56 flex-shrink-0 flex-col border-r border-gray-200 bg-white">
      {/* Brand */}
      <div className="flex h-14 items-center gap-2.5 border-b border-gray-200 px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600">
          <span className="text-xs font-bold text-white">O</span>
        </div>
        <span className="text-sm font-semibold text-gray-900">OpenCRM</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = currentPath.startsWith(item.href);
            return (
              <li key={item.href}>
                <a
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-blue-50 font-medium text-blue-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <span className="text-base leading-none">{item.icon}</span>
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User footer — Phase 3: show real user name/avatar */}
      <div className="border-t border-gray-200 p-3">
        <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-600">
            U
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-gray-700">Agent</p>
            <p className="truncate text-xs text-gray-400">agent@company.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ------------------------------------------------------------------
// Top bar placeholder
// ------------------------------------------------------------------
function AppTopBar() {
  return (
    <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
      {/* Page title — Phase 3: derive from route meta */}
      <h2 className="text-sm font-semibold text-gray-700">
        {typeof window !== "undefined"
          ? formatPageTitle(window.location.pathname)
          : ""}
      </h2>

      {/* Right actions — Phase 3: notifications, user menu */}
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-green-400" title="Online" />
        <span className="text-xs text-gray-400">Online</span>
      </div>
    </header>
  );
}

function formatPageTitle(pathname: string): string {
  const segment = pathname.split("/").filter(Boolean)[0] ?? "";
  if (!segment) return "Dashboard";
  return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
}
