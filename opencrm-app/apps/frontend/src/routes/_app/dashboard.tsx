// =============================================================
// Dashboard Page (Phase 1 — placeholder)
//
// Phase 1: renders a realistic placeholder card grid to
//   confirm the app shell and routing work correctly.
//
// Phase 5: replace with real KPI metrics from
//   GET /api/metrics/dashboard
// =============================================================

import { createFileRoute } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/dashboard")({
  component: DashboardPage,
});

const PLACEHOLDER_STATS = [
  { label: "Open Conversations", value: "—", color: "bg-blue-50 text-blue-700" },
  { label: "Pending Handovers", value: "—", color: "bg-amber-50 text-amber-700" },
  { label: "Customers", value: "—", color: "bg-green-50 text-green-700" },
  { label: "Resolved Today", value: "—", color: "bg-purple-50 text-purple-700" },
];

function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your workspace activity.
        </p>
      </div>

      {/* Phase label */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
        <strong>Phase 1 scaffold</strong> — real metrics will be connected in
        Phase 5.
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PLACEHOLDER_STATS.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <p className="text-xs font-medium text-gray-500">{stat.label}</p>
            <p
              className={cn(
                "mt-2 inline-flex items-center rounded-md px-2 py-0.5 text-2xl font-bold",
                stat.color
              )}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Empty state chart area */}
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
        <p className="text-sm text-gray-400">
          Charts and analytics will appear here in Phase 5.
        </p>
      </div>
    </div>
  );
}
