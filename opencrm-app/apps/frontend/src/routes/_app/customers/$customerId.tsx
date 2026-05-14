// =============================================================
// Customer Detail (Phase 5)
//
// GET /api/customers/:id
// Response: { data: { ...customer, contacts: [], deals: [] } }
// =============================================================

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Building2, Globe, MapPin, Phone, Mail, User, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCustomer, updateCustomer, type CustomerDetail, type DealSummary } from "@/lib/api";

export const Route = createFileRoute("/_app/customers/$customerId")({
  component: CustomerDetailPage,
});

const STAGE_COLORS: Record<string, string> = {
  lead:         "bg-blue-100 text-blue-700",
  qualified:    "bg-cyan-100 text-cyan-700",
  proposal:     "bg-amber-100 text-amber-700",
  negotiation:  "bg-orange-100 text-orange-700",
  won:          "bg-emerald-100 text-emerald-700",
  lost:         "bg-red-100 text-red-700",
};

function CustomerDetailPage() {
  const { customerId } = Route.useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", notes: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, [customerId]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await getCustomer(customerId);
      setCustomer(res.data);
      setForm({
        name: res.data.name,
        email: res.data.email ?? "",
        phone: res.data.phone ?? "",
        company: res.data.company ?? "",
        notes: res.data.notes ?? "",
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load customer");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!customer) return;
    setSaving(true);
    try {
      const res = await updateCustomer(customerId, {
        name: form.name,
        email: form.email || undefined,
        phone: form.phone || undefined,
        company: form.company || undefined,
        notes: form.notes || undefined,
      });
      setCustomer((c) => c ? { ...c, ...res.data } : c);
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="ocm-page">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </main>
    );
  }

  if (error || !customer) {
    return (
      <main className="ocm-page">
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error ?? "Customer not found"}
        </div>
        <Link to="/customers" className="text-sm text-primary hover:underline">← Back to customers</Link>
      </main>
    );
  }

  return (
    <main className="ocm-page">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link
          to="/customers"
          className="mt-0.5 rounded-md p-1 text-muted-foreground hover:bg-muted transition-colors"
        >
          <ArrowLeft size={16} />
        </Link>
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-foreground">{customer.name}</h1>
          {customer.company && (
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Building2 size={11} /> {customer.company}
            </p>
          )}
        </div>
        <button
          onClick={() => setEditing((v) => !v)}
          className={cn(
            "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
            editing
              ? "border-border bg-muted text-muted-foreground hover:bg-muted/80"
              : "border-primary bg-primary/10 text-primary hover:bg-primary/15"
          )}
        >
          {editing ? "Cancel" : "Edit"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

        {/* Left: Profile */}
        <div className="flex flex-col gap-4 lg:col-span-1">
          <section className="ocm-card p-4">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Profile
            </h2>
            {editing ? (
              <form onSubmit={handleSave} className="flex flex-col gap-3">
                {(["name", "company", "email", "phone", "notes"] as const).map((field) => (
                  <div key={field} className="flex flex-col gap-1">
                    <label className="text-xs font-medium capitalize text-muted-foreground">
                      {field}{field === "name" ? " *" : ""}
                    </label>
                    {field === "notes" ? (
                      <textarea
                        rows={3}
                        value={form[field]}
                        onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                      />
                    ) : (
                      <input
                        type="text"
                        value={form[field]}
                        onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    )}
                  </div>
                ))}
                <button
                  type="submit"
                  disabled={saving || !form.name.trim()}
                  className="rounded-lg bg-primary py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </form>
            ) : (
              <dl className="space-y-2.5">
                {[
                  { icon: Mail, label: "Email", value: customer.email },
                  { icon: Phone, label: "Phone", value: customer.phone },
                  { icon: Building2, label: "Industry", value: customer.industry },
                  { icon: Globe, label: "Website", value: customer.website },
                  { icon: MapPin, label: "Address", value: customer.address },
                ].map(({ icon: Icon, label, value }) => value ? (
                  <div key={label} className="flex items-start gap-2">
                    <Icon size={13} className="mt-0.5 shrink-0 text-muted-foreground" />
                    <div>
                      <dt className="text-[11px] text-muted-foreground">{label}</dt>
                      <dd className="text-sm text-foreground break-all">{value}</dd>
                    </div>
                  </div>
                ) : null)}
                {customer.notes && (
                  <div className="rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                    {customer.notes}
                  </div>
                )}
              </dl>
            )}
          </section>
        </div>

        {/* Right: Contacts + Deals */}
        <div className="flex flex-col gap-4 lg:col-span-2">

          {/* Contacts */}
          <section className="ocm-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h2 className="text-sm font-semibold">
                Contacts
                <span className="ml-1.5 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {customer.contacts.length}
                </span>
              </h2>
            </div>
            {customer.contacts.length === 0 ? (
              <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
                <User size={16} />
                <p className="text-sm">No contacts yet</p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {customer.contacts.map((c) => (
                  <li key={c.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {c.firstName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {c.firstName}{c.lastName ? ` ${c.lastName}` : ""}
                        {c.isPrimary && (
                          <span className="ml-1.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                            Primary
                          </span>
                        )}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {c.jobTitle ?? c.email ?? c.phone ?? ""}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Deals */}
          <section className="ocm-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h2 className="text-sm font-semibold">
                Deals
                <span className="ml-1.5 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {customer.deals.length}
                </span>
              </h2>
            </div>
            {customer.deals.length === 0 ? (
              <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
                <ChevronRight size={16} />
                <p className="text-sm">No deals yet</p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {customer.deals.map((d) => (
                  <li key={d.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{d.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(d.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {d.value && (
                        <span className="text-sm font-semibold tabular-nums">
                          {d.currency} {Number(d.value).toLocaleString()}
                        </span>
                      )}
                      <span className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize",
                        STAGE_COLORS[d.stage] ?? "bg-muted text-muted-foreground"
                      )}>
                        {d.stage}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
