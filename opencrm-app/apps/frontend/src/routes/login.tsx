// =============================================================
// Login Page (Phase 4)
//
// Per builder contract (frontend/UI-REFERENCE.md §2, PAGE-API-MAP.md /login):
//   POST /auth/sign-in/email (Better Auth root surface)
//   → store scalechat_token in localStorage
//   → syncOrganizationContextFromSession()
//   → if no org → /onboarding
//   → else → /dashboard
// =============================================================

import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { signIn, setToken } from "@/lib/api";
import { syncOrganizationContextFromSession } from "@/lib/organization";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signIn(email, password);

      // Store token if returned (Better Auth may use cookies instead)
      if (result.token) {
        setToken(result.token);
      }

      // Sync org context; decide where to route
      const sync = await syncOrganizationContextFromSession();

      if (!sync.hasOrg) {
        await navigate({ to: "/onboarding" });
      } else {
        await navigate({ to: "/dashboard" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/5 px-4">
      <div className="mx-auto w-full max-w-md space-y-8 py-12">
        <div className="flex flex-col gap-6">

          {/* Logo + brand */}
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-900 text-white shadow-md">
              <span className="text-2xl font-bold">🚀</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">OpenCRM</h1>
              <p className="text-sm text-muted-foreground">WhatsApp Messaging Platform</p>
            </div>
          </div>

          {/* Card */}
          <div className="rounded-xl bg-card/50 p-8 shadow-xl backdrop-blur-sm transition-all hover:shadow-2xl">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">

              <div className="flex flex-col items-center gap-1 text-center">
                <h2 className="text-2xl font-bold">Welcome Back</h2>
                <p className="text-sm text-muted-foreground text-balance">
                  Enter your email and password to continue
                </p>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className={cn(
                    "rounded-lg border border-input bg-background px-3 py-2 text-sm",
                    "placeholder:text-muted-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
                    "disabled:cursor-not-allowed disabled:opacity-50"
                  )}
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium">
                    Password
                  </label>
                  <a href="/" className="text-sm font-medium text-muted-foreground hover:underline">
                    Forgot password?
                  </a>
                </div>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className={cn(
                    "rounded-lg border border-input bg-background px-3 py-2 text-sm",
                    "placeholder:text-muted-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
                    "disabled:cursor-not-allowed disabled:opacity-50"
                  )}
                />
              </div>

              {/* Error */}
              {error && (
                <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className={cn(
                  "w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground",
                  "hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  "disabled:cursor-not-allowed disabled:opacity-60",
                  "transition-opacity"
                )}
              >
                {loading ? "Signing in…" : "Login"}
              </button>

              {/* Tip */}
              <div className="rounded-md border border-amber-200/50 bg-amber-50/50 px-3 py-2 text-center text-sm text-amber-700">
                💡 Login issues? Try Ctrl+Shift+R or clear browser cache.
              </div>
            </form>
          </div>

          {/* Footer */}
          <p className="px-8 text-center text-xs text-muted-foreground">
            By logging in, you agree to our{" "}
            <Link to="/terms" className="underline underline-offset-2 hover:text-foreground">
              Terms
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="underline underline-offset-2 hover:text-foreground">
              Privacy
            </Link>
          </p>
          <p className="text-center text-xs text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="font-medium text-foreground hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
