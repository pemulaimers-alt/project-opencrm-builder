// =============================================================
// Index route — redirects to /login or /dashboard
//
// Phase 1: simple redirect to /login.
// Phase 3: will check auth session and redirect to /dashboard
// if already authenticated.
// =============================================================

import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    // Phase 3: replace with real session check
    // const session = await getSession();
    // if (session) throw redirect({ to: "/dashboard" });
    throw redirect({ to: "/login" });
  },
  component: () => null,
});
