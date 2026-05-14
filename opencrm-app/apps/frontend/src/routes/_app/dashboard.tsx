// =============================================================
// Dashboard Page (Phase 4)
//
// Per builder contract (UI-REFERENCE.md §6, PAGE-API-MAP.md /dashboard):
//   GET /api/metrics/dashboard?range=7d  (deferred — no metrics module yet)
//
// Phase 4: renders the correct layout shell, stat card structure,
//   and placeholder data so the visual parity is established.
//   Real data wiring happens when the metrics module is built.
// =============================================================

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  MessageSquare,
  Bot,
  Clock,
  Users,
  AlertCircle,
  CheckCircle2,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { listCustomers } from "@/lib/api";

export const Route = createFileRoute("/_app/dashboard")({
  component: DashboardPage,
});

// ── Types ─────────────────────────────────────────────────────

interface StatCard {
  label: string;
  value: string;
  delta: string;
  positive: boolean;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

interface Alert {
  tone: "success" | "warning" | "info";
  title: string;
  description: string;
}

// ── Static placeholder data ───────────────────────────────────

const DAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

// ── Component ─────────────────────────────────────────────────

function DashboardPage() {
  // Live: customer total from /api/customers/
  const [customerTotal, setCustomerTotal] = useState<number | null>(null);

  useEffect(() => {
    listCustomers({ per_page: 1 })
      .then((res) => setCustomerTotal(res.total))
      .catch(() => {});
  }, []);

  const STAT_CARDS: StatCard[] = [
    { label: "Chat masuk",  value: "—",      delta: "—", positive: true, icon: MessageSquare },
    { label: "AI resolved", value: "—",      delta: "—", positive: true, icon: Bot },
    { label: "Avg response",value: "—",      delta: "—", positive: true, icon: Clock },
    {
      label: "Pelanggan",
      value: customerTotal !== null ? customerTotal.toLocaleString() : "—",
      delta: "—",
      positive: true,
      icon: Users,
    },
  ];

  const ALERTS: Alert[] = [
    {
      tone: customerTotal !== null ? "success" : "info",
      title: customerTotal !== null ? `${customerTotal.toLocaleString()} customers in workspace` : "Dashboard connected",
      description: "Chat volume, AI resolution, and response time metrics will appear here once the analytics module is active.",
    },
  ];

  return (
    <main className="ocm-page">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
          <p className="text-xs text-muted-foreground">
            Overview of your workspace activity
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="today">Today</option>
          </select>
        </div>
      </div>

      {/* Stat cards — 4-column grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map((card) => (
          <div key={card.label} className="ocm-card p-5">
            <div className="flex items-start justify-between">
              <p className="text-xs font-medium text-muted-foreground">
                {card.label}
              </p>
              <div className="rounded-lg bg-primary/10 p-1.5 text-primary">
                <card.icon size={14} />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">
              {card.value}
            </p>
            <p
              className={cn(
                "mt-1 text-xs font-medium",
                card.positive ? "text-emerald-500" : "text-red-500"
              )}
            >
              {card.delta}
            </p>
          </div>
        ))}
      </div>

      {/* Charts row — 2-column */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

        {/* Chat volume */}
        <section className="ocm-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold">Chat Volume</h2>
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <span className="ocm-tag bg-blue-100 text-blue-700">AI</span>
              <span className="ocm-tag bg-emerald-100 text-emerald-700">CS</span>
              <span className="ocm-tag bg-amber-100 text-amber-700">Handover</span>
            </div>
          </div>
          <div className="space-y-3 p-4">
            {DAYS.map((day) => (
              <div key={day}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">{day}</span>
                  <span className="text-muted-foreground">—</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-0 rounded-full bg-primary/50" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Sales funnel */}
        <section className="ocm-card">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold">Sales Funnel</h2>
          </div>
          <div className="flex flex-col gap-2 p-4">
            {["New Lead", "Qualified", "Proposal", "Won"].map((stage, i) => (
              <div key={stage} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-xs text-muted-foreground">
                  {stage}
                </span>
                <div className="flex-1 overflow-hidden rounded-full bg-muted h-3">
                  <div
                    className="h-full rounded-full bg-primary/60"
                    style={{ width: `${100 - i * 22}%` }}
                  />
                </div>
                <span className="w-6 text-right text-xs text-muted-foreground">
                  —
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Bottom row — agent table + alerts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

        {/* Agent performance */}
        <section className="ocm-card overflow-hidden">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold">Agent Performance</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="ocm-table w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-2 text-left">Agent</th>
                  <th className="px-4 py-2 text-right">Chats</th>
                  <th className="px-4 py-2 text-right">CSAT</th>
                  <th className="px-4 py-2 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-muted-foreground" />
                      <span className="text-xs text-muted-foreground italic">
                        No data yet
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-muted-foreground">—</td>
                  <td className="px-4 py-3 text-right text-xs text-muted-foreground">—</td>
                  <td className="px-4 py-3 text-right text-xs text-muted-foreground">—</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Operational alerts */}
        <section className="ocm-card">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold">Alerts</h2>
          </div>
          <div className="flex flex-col gap-2 p-4">
            {ALERTS.map((alert) => (
              <AlertItem key={alert.title} {...alert} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

// ── Alert item ────────────────────────────────────────────────

const ALERT_STYLES = {
  success: {
    border: "border-emerald-500/25",
    bg: "bg-emerald-500/10",
    text: "text-emerald-600",
    icon: CheckCircle2,
  },
  warning: {
    border: "border-amber-500/25",
    bg: "bg-amber-500/10",
    text: "text-amber-600",
    icon: AlertCircle,
  },
  info: {
    border: "border-blue-500/25",
    bg: "bg-blue-500/10",
    text: "text-blue-600",
    icon: Info,
  },
} as const;

function AlertItem({ tone, title, description }: Alert) {
  const style = ALERT_STYLES[tone];
  return (
    <div
      className={cn(
        "rounded-lg border p-3",
        style.border,
        style.bg,
        style.text
      )}
    >
      <div className="flex items-start gap-2">
        <style.icon size={14} className="mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}
