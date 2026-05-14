// =============================================================
// Root Layout — wraps every page
//
// Responsibilities (Phase 1):
//   - Import global styles
//   - Render <Outlet /> for child routes
//
// Deferred to later phases:
//   - ThemeProvider (dark/light mode)    Phase 3
//   - Toast notifications (Sonner)       Phase 3
//   - Auth session hydration             Phase 3
//   - Organization context provider      Phase 3
// =============================================================

import { createRootRoute, Outlet } from "@tanstack/react-router";
import "../styles.css";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <Outlet />
    </div>
  );
}
