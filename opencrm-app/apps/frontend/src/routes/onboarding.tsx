// =============================================================
// Onboarding Page (Phase 4)
//
// Per builder contract (PAGE-API-MAP.md /onboarding,
// frontend/blueprint.md auth guard flow):
//   1. Verify user is authenticated (token + /api/auth/context)
//   2. If already has org → redirect /dashboard
//   3. Show company name form
//   4. POST /api/auth/onboarding { companyName, slug? }
//   5. persistOrgContext → navigate /dashboard
// =============================================================

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { getToken, postOnboarding } from "@/lib/api";
import {
  syncOrganizationContextFromSession,
  persistOrgContext,
} from "@/lib/organization";

export const Route = createFileRoute("/onboarding")({
  component: OnboardingPage,
});

function OnboardingPage() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [companyName, setCompanyName] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Guard: must be authenticated; skip if already has org
  useEffect(() => {
    (async () => {
      const token = getToken();
      if (!token) {
        await navigate({ to: "/login" });
        return;
      }
      const sync = await syncOrganizationContextFromSession();
      if (!sync.authenticated) {
        await navigate({ to: "/login" });
        return;
      }
      if (sync.hasOrg) {
        await navigate({ to: "/dashboard" });
        return;
      }
      setChecking(false);
    })();
  }, [navigate]);

  // Auto-derive slug from company name
  function handleNameChange(val: string) {
    setCompanyName(val);
    setSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!companyName.trim()) return;
    setError(null);
    setLoading(true);

    try {
      const result = await postOnboarding(companyName.trim(), slug || undefined);
      // Persist new org context immediately
      persistOrgContext({
        user: null,
        organization: {
          id: result.organization.id,
          name: result.organization.name,
          slug: result.organization.slug,
          appId: result.app.id,
        },
        appId: result.app.id,
      });
      await navigate({ to: "/dashboard" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/5 px-4">
      <div className="mx-auto w-full max-w-md space-y-8 py-12">
        <div className="flex flex-col gap-6">

          {/* Header */}
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-900 text-white shadow-md">
              <span className="text-2xl">🏢</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Set Up Your Workspace</h1>
              <p className="text-sm text-muted-foreground">
                Create your organization to get started
              </p>
            </div>
          </div>

          {/* Card */}
          <div className="rounded-xl bg-card/50 p-8 shadow-xl backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

              {/* Company Name */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="companyName" className="text-sm font-medium">
                  Company / Workspace Name
                </label>
                <input
                  id="companyName"
                  type="text"
                  required
                  placeholder="Acme Corp"
                  value={companyName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  disabled={loading}
                  className={cn(
                    "rounded-lg border border-input bg-background px-3 py-2 text-sm",
                    "placeholder:text-muted-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
                    "disabled:cursor-not-allowed disabled:opacity-50"
                  )}
                />
              </div>

              {/* Slug preview */}
              {slug && (
                <p className="text-xs text-muted-foreground">
                  Workspace URL:{" "}
                  <span className="font-mono font-semibold text-foreground">
                    {slug}
                  </span>
                </p>
              )}

              {/* Error */}
              {error && (
                <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !companyName.trim()}
                className={cn(
                  "w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground",
                  "hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  "disabled:cursor-not-allowed disabled:opacity-60 transition-opacity"
                )}
              >
                {loading ? "Creating workspace…" : "Create Workspace"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
