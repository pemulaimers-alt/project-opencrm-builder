// =============================================================
// Login Page (Phase 1 — stub)
//
// Phase 1: renders a realistic login UI shell with form fields.
//   Form submission is wired with a placeholder handler.
//
// Phase 3: wire to POST /auth/sign-in/email (Better Auth),
//   handle token storage, redirect to /dashboard on success.
// =============================================================

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // TODO Phase 3: replace with real auth call
      // const res = await fetch("/auth/sign-in/email", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ email, password }),
      // });
      // if (!res.ok) throw new Error("Invalid credentials");
      // const { token } = await res.json();
      // localStorage.setItem("scalechat_token", token);
      // await navigate({ to: "/dashboard" });

      // Phase 1: simulate a brief delay then show placeholder message
      await new Promise((r) => setTimeout(r, 800));
      setError("Auth not implemented yet — coming in Phase 3.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo / Brand */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
            <span className="text-xl font-bold text-white">O</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            OpenCRM
          </h1>
          <p className="mt-1 text-sm text-gray-500">Sign in to your workspace</p>
        </div>

        {/* Form card */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className={cn(
                  "block w-full rounded-lg border border-gray-300 bg-white px-3 py-2",
                  "text-sm text-gray-900 placeholder-gray-400",
                  "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20",
                  "disabled:cursor-not-allowed disabled:opacity-50"
                )}
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={cn(
                  "block w-full rounded-lg border border-gray-300 bg-white px-3 py-2",
                  "text-sm text-gray-900 placeholder-gray-400",
                  "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20",
                  "disabled:cursor-not-allowed disabled:opacity-50"
                )}
                disabled={loading}
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white",
                "hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                "disabled:cursor-not-allowed disabled:opacity-60",
                "transition-colors duration-150"
              )}
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400">
          Don&apos;t have an account?{" "}
          <a href="/register" className="text-blue-600 hover:underline">
            Create one
          </a>
        </p>
      </div>
    </div>
  );
}
