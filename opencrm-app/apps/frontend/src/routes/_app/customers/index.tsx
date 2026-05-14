// =============================================================
// Customers List (Phase 5)
//
// GET /api/customers/?q=&page=&per_page=
// Response: { data: Customer[], total, page, limit }
// =============================================================

import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Search, Plus, Building2, Phone, Mail, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { listCustomers, createCustomer, type Customer } from "@/lib/api";

export const Route = createFileRoute("/_app/customers/")({
  component: CustomersPage,
});

function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create modal state
  const [showCreate, setShowCreate] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "" });
  const [creating, setCreating] = useState(false);

  const PER_PAGE = 25;

  // Debounce search: wait 350ms after last keystroke before fetching
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => setDebouncedSearch(value), 350);
  }

  useEffect(() => {
    load();
  }, [page, debouncedSearch]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await listCustomers({ page, per_page: PER_PAGE, search: debouncedSearch || undefined });
      setCustomers(res.data);
      setTotal(res.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load customers");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setCreating(true);
    setCreateError(null);
    try {
      await createCustomer({
        name: form.name.trim(),
        email: form.email || undefined,
        phone: form.phone || undefined,
        company: form.company || undefined,
      });
      setForm({ name: "", email: "", phone: "", company: "" });
      setShowCreate(false);
      await load();
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : "Failed to create customer");
    } finally {
      setCreating(false);
    }
  }

  function openCreate() {
    setForm({ name: "", email: "", phone: "", company: "" });
    setCreateError(null);
    setShowCreate(true);
  }

  function closeCreate() {
    setCreateError(null);
    setShowCreate(false);
  }

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <main className="ocm-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Pelanggan</h1>
          <p className="text-xs text-muted-foreground">
            {loading ? "Loading…" : `${total.toLocaleString()} total customers`}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <Plus size={14} />
          New Customer
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by name, email, or company…"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full rounded-lg border border-border bg-background py-2 pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="ocm-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="ocm-table w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Company</th>
                <th className="px-4 py-3 text-left">Contact</th>
                <th className="px-4 py-3 text-right">Contacts</th>
                <th className="px-4 py-3 text-right">Deals</th>
                <th className="px-4 py-3 text-left">Created</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    Loading…
                  </td>
                </tr>
              )}
              {!loading && customers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Users size={24} />
                      <p className="text-sm">{search ? "No customers match your search." : "No customers yet."}</p>
                    </div>
                  </td>
                </tr>
              )}
              {!loading && customers.map((c) => (
                <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      to="/customers/$customerId"
                      params={{ customerId: c.id }}
                      className="font-medium text-foreground hover:text-primary hover:underline text-sm"
                    >
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {c.company ? (
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Building2 size={12} />
                        {c.company}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground/50">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      {c.email && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Mail size={11} /> {c.email}
                        </div>
                      )}
                      {c.phone && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone size={11} /> {c.phone}
                        </div>
                      )}
                      {!c.email && !c.phone && <span className="text-xs text-muted-foreground/50">—</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-sm tabular-nums">
                    {c._count?.contacts ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-sm tabular-nums">
                    {c._count?.deals ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <p className="text-xs text-muted-foreground">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-md border border-border px-3 py-1 text-xs disabled:opacity-40 hover:bg-muted transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="rounded-md border border-border px-3 py-1 text-xs disabled:opacity-40 hover:bg-muted transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-card shadow-xl">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold">New Customer</h2>
            </div>
            <form onSubmit={handleCreate} className="flex flex-col gap-4 p-5">
              {[
                { id: "name", label: "Name *", placeholder: "Customer name", key: "name" as const },
                { id: "company", label: "Company", placeholder: "Company name", key: "company" as const },
                { id: "email", label: "Email", placeholder: "email@example.com", key: "email" as const },
                { id: "phone", label: "Phone", placeholder: "+1 234 567 8900", key: "phone" as const },
              ].map((field) => (
                <div key={field.id} className="flex flex-col gap-1">
                  <label htmlFor={field.id} className="text-xs font-medium text-muted-foreground">
                    {field.label}
                  </label>
                  <input
                    id={field.id}
                    type="text"
                    placeholder={field.placeholder}
                    value={form[field.key]}
                    onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              ))}
              {createError && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {createError}
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeCreate}
                  className="flex-1 rounded-lg border border-border py-2 text-sm hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !form.name.trim()}
                  className="flex-1 rounded-lg bg-primary py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {creating ? "Creating…" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
