// =============================================================
// Settings (Phase 5)
//
// Wired surfaces:
//   GET /api/auth/me        → current user profile + update
//   PATCH /api/user/:id     → update name/avatar/phone
//   GET /api/teams/         → team list
//   POST /api/teams/        → create team
//   DELETE /api/teams/:id   → delete team
//
// Deferred (no backend module yet):
//   AI settings, WhatsApp settings, labels, SLA, contacts config,
//   auto-assign rules, Pakasir settings
// =============================================================

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Users, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getMe, updateUserProfile,
  listTeams, createTeam, deleteTeam,
  type AuthUser, type Team,
} from "@/lib/api";
import { PlaceholderPage } from "./-placeholder";

export const Route = createFileRoute("/_app/settings")({
  component: SettingsPage,
});

type Tab = "profile" | "teams" | "advanced";

function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  const TABS: { id: Tab; label: string }[] = [
    { id: "profile", label: "My Profile" },
    { id: "teams",   label: "Teams" },
    { id: "advanced",label: "Advanced" },
  ];

  return (
    <main className="ocm-page">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Settings</h1>
        <p className="text-xs text-muted-foreground">Workspace configuration</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 rounded-lg border border-border bg-muted/40 p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={cn(
              "rounded-md px-4 py-1.5 text-xs font-medium transition-colors",
              activeTab === t.id
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "profile"  && <ProfileTab />}
      {activeTab === "teams"    && <TeamsTab />}
      {activeTab === "advanced" && (
        <PlaceholderPage
          title="Advanced Settings"
          description="AI settings, WhatsApp, labels, SLA, auto-assign, and Pakasir configuration — deferred to a later phase."
          phase="Phase 6"
        />
      )}
    </main>
  );
}

// ── Profile Tab ───────────────────────────────────────────────

function ProfileTab() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "" });

  useEffect(() => {
    getMe()
      .then((u) => {
        setUser(u);
        setForm({ name: u.name, phone: "" });
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await updateUserProfile(user.id, {
        name: form.name || undefined,
        phone: form.phone || undefined,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div className="max-w-lg">
      <section className="ocm-card p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{user?.name}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
            <p className="text-xs capitalize text-muted-foreground">{user?.role ?? "agent"}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Display Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Phone</label>
            <input
              type="text"
              placeholder="Your phone number"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}
          {success && (
            <p className="text-xs text-emerald-600">Profile updated.</p>
          )}
          <button
            type="submit"
            disabled={saving || !form.name.trim()}
            className="rounded-lg bg-primary py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {saving ? "Saving…" : "Save Profile"}
          </button>
        </form>
      </section>
    </div>
  );
}

// ── Teams Tab ─────────────────────────────────────────────────

function TeamsTab() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const t = await listTeams();
      setTeams(t);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load teams");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await createTeam({ name: newName.trim() });
      setNewName("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create team");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this team?")) return;
    try {
      await deleteTeam(id);
      // Reload from server instead of optimistic removal,
      // so UI only updates if the delete actually succeeded.
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete team");
    }
  }

  return (
    <div className="max-w-lg flex flex-col gap-4">

      {/* Create form */}
      <form onSubmit={handleCreate} className="flex gap-2">
        <input
          type="text"
          placeholder="New team name…"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          disabled={creating || !newName.trim()}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          <Plus size={14} /> Create
        </button>
      </form>

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}

      {/* Team list */}
      <section className="ocm-card overflow-hidden">
        {loading ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">Loading…</p>
        ) : teams.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
            <Users size={22} />
            <p className="text-sm">No teams yet. Create one above.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {teams.map((team) => (
              <li key={team.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                  {team.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{team.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(team.users?.length ?? 0)} member{(team.users?.length ?? 0) !== 1 ? "s" : ""}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(team.id)}
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                  title="Delete team"
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
