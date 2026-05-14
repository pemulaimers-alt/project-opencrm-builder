// =============================================================
// Root Layout (Phase 4)
//
// Per builder contract (frontend/blueprint.md __root.tsx):
//   - ThemeProvider (next-themes) — deferred: added in Phase 5
//   - Sonner <Toaster /> for toast notifications
//   - Global styles
// =============================================================

import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Toaster } from "sonner";
import "../styles.css";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <Outlet />
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}
