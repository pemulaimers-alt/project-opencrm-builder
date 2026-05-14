// =============================================================
// Inbox / Chat Page (Phase 6A)
//
// Wired to:
//   GET  /api/conversations/              — conversation list
//   GET  /api/conversations/:id           — conversation detail
//   GET  /api/conversations/:id/messages  — message thread
//   POST /api/conversations/:id/messages  — send message
//   POST /api/conversations/              — create conversation
//   PATCH /api/conversations/:id/status   — resolve/reopen
//
// Realtime (Socket.IO) is deferred to Phase 6B.
// New messages require a manual refresh or polling until then.
// =============================================================

import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  MessageSquare,
  Plus,
  Search,
  Send,
  CheckCheck,
  Clock,
  Loader2,
  Users,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  listConversations,
  getConversationMessages,
  sendConversationMessage,
  createConversation,
  updateConversationStatus,
  type Conversation,
  type ConversationMessage,
} from "@/lib/api";

export const Route = createFileRoute("/_app/chat")({
  component: ChatPage,
});

// ── Status badge ───────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  open:     "bg-emerald-100 text-emerald-700",
  pending:  "bg-amber-100 text-amber-700",
  resolved: "bg-gray-100 text-gray-500",
};

// ── Root page ─────────────────────────────────────────────────

function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [total,         setTotal]         = useState(0);
  const [loading,       setLoading]       = useState(true);
  const [loadError,     setLoadError]     = useState<string | null>(null);
  const [statusFilter,  setStatusFilter]  = useState<string>("open");
  const [selectedId,    setSelectedId]    = useState<string | null>(null);
  const [showCreate,    setShowCreate]    = useState(false);

  // Load conversation list
  async function loadList() {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await listConversations({ status: statusFilter, limit: 40 });
      setConversations(res.data);
      setTotal(res.total);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Failed to load conversations");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadList();
    // Deselect when filter changes
    setSelectedId(null);
  }, [statusFilter]);

  const selected = conversations.find((c) => c.id === selectedId) ?? null;

  return (
    <div className="flex h-full min-h-0 overflow-hidden">
      {/* ── Left panel: list ── */}
      <aside className="flex w-72 flex-shrink-0 flex-col border-r border-border bg-card">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <h1 className="text-sm font-semibold text-foreground">Inbox</h1>
            <p className="text-[11px] text-muted-foreground">
              {loading ? "Loading…" : `${total} conversations`}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={loadList}
              disabled={loading}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted transition-colors disabled:opacity-40"
              title="Refresh"
            >
              <RefreshCw size={14} />
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted transition-colors"
              title="New conversation"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-0.5 border-b border-border px-2 py-2">
          {(["open", "pending", "resolved"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "flex-1 rounded-md py-1 text-[11px] font-medium capitalize transition-colors",
                statusFilter === s
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {s}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              <Loader2 size={18} className="animate-spin" />
            </div>
          )}
          {!loading && loadError && (
            <div className="px-4 py-3 text-xs text-destructive">{loadError}</div>
          )}
          {!loading && !loadError && conversations.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
              <MessageSquare size={22} />
              <p className="text-xs">No {statusFilter} conversations</p>
            </div>
          )}
          {!loading && conversations.map((conv) => (
            <ConversationRow
              key={conv.id}
              conv={conv}
              selected={selectedId === conv.id}
              onClick={() => setSelectedId(conv.id)}
            />
          ))}
        </div>
      </aside>

      {/* ── Right panel: thread ── */}
      <main className="flex min-w-0 flex-1 flex-col bg-background">
        {selectedId ? (
          <ThreadPanel
            key={selectedId}
            conversationId={selectedId}
            onStatusChange={(newStatus) => {
              setConversations((list) =>
                list.map((c) => c.id === selectedId ? { ...c, status: newStatus } : c)
              );
            }}
          />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground">
            <MessageSquare size={28} />
            <p className="text-sm">Select a conversation</p>
          </div>
        )}
      </main>

      {/* Create modal */}
      {showCreate && (
        <CreateConversationModal
          onClose={() => setShowCreate(false)}
          onCreated={(conv) => {
            setConversations((list) => [conv, ...list]);
            setSelectedId(conv.id);
            setShowCreate(false);
          }}
        />
      )}
    </div>
  );
}

// ── Conversation list row ─────────────────────────────────────

function ConversationRow({
  conv, selected, onClick,
}: {
  conv: Conversation;
  selected: boolean;
  onClick: () => void;
}) {
  const lastMsg = conv.messages?.[0];
  const statusStyle = STATUS_STYLES[conv.status] ?? "bg-muted text-muted-foreground";

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full border-b border-border px-4 py-3 text-left transition-colors",
        selected ? "bg-primary/5" : "hover:bg-muted/40"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {conv.subject || conv.customer?.name || "Untitled"}
          </p>
          {conv.customer && (
            <p className="truncate text-[11px] text-muted-foreground">
              {conv.customer.name}
              {conv.customer.company ? ` · ${conv.customer.company}` : ""}
            </p>
          )}
          {lastMsg && (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {lastMsg.content}
            </p>
          )}
        </div>
        <div className="flex flex-shrink-0 flex-col items-end gap-1">
          <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-medium capitalize", statusStyle)}>
            {conv.status}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {new Date(conv.updatedAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </button>
  );
}

// ── Thread panel ──────────────────────────────────────────────

function ThreadPanel({
  conversationId,
  onStatusChange,
}: {
  conversationId: string;
  onStatusChange: (status: string) => void;
}) {
  const [conv,      setConv]      = useState<Conversation | null>(null);
  const [messages,  setMessages]  = useState<ConversationMessage[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [input,     setInput]     = useState("");
  const [sending,   setSending]   = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadThread();
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadThread() {
    setLoading(true);
    setError(null);
    try {
      const [convRes, msgsRes] = await Promise.all([
        getConversation(conversationId),
        getConversationMessages(conversationId, { limit: 100 }),
      ]);
      setConv(convRes.data);
      setMessages(msgsRes.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load conversation");
    } finally {
      setLoading(false);
    }
  }

  async function handleSend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!input.trim() || sending) return;
    const content = input.trim();
    setInput("");
    setSending(true);
    try {
      const res = await sendConversationMessage(conversationId, content);
      setMessages((prev) => [...prev, res.data]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send");
      setInput(content); // restore on failure
    } finally {
      setSending(false);
    }
  }

  async function handleResolve() {
    if (!conv) return;
    const next = conv.status === "resolved" ? "open" : "resolved";
    try {
      const res = await updateConversationStatus(conversationId, next);
      setConv((c) => c ? { ...c, status: next } : c);
      onStatusChange(next);
    } catch {
      setError("Failed to update status");
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground">
        <Loader2 size={20} className="animate-spin" />
      </div>
    );
  }

  if (error && !conv) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 text-muted-foreground">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Thread header */}
      <div className="flex items-center justify-between border-b border-border bg-card px-5 py-3">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold text-foreground">
            {conv?.subject || conv?.customer?.name || "Conversation"}
          </h2>
          {conv?.customer && (
            <p className="text-xs text-muted-foreground">
              {conv.customer.name}
              {conv.customer.company ? ` · ${conv.customer.company}` : ""}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-medium capitalize",
            STATUS_STYLES[conv?.status ?? "open"] ?? "bg-muted text-muted-foreground"
          )}>
            {conv?.status}
          </span>
          <button
            onClick={handleResolve}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
              conv?.status === "resolved"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/15"
                : "border-border bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {conv?.status === "resolved" ? "Reopen" : "Resolve"}
          </button>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
            <MessageSquare size={22} />
            <p className="text-sm">No messages yet. Start the conversation below.</p>
          </div>
        )}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Send form */}
      <form
        onSubmit={handleSend}
        className="flex items-end gap-2 border-t border-border bg-card px-4 py-3"
      >
        <textarea
          rows={2}
          placeholder="Type a message…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
          disabled={sending}
          className="flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="flex items-center justify-center rounded-lg bg-primary p-2.5 text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {sending
            ? <Loader2 size={16} className="animate-spin" />
            : <Send size={16} />
          }
        </button>
      </form>
    </div>
  );
}

// ── Message bubble ────────────────────────────────────────────

function MessageBubble({ msg }: { msg: ConversationMessage }) {
  const isAgent  = msg.senderType === "agent";
  const isSystem = msg.senderType === "system";

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <span className="rounded-full bg-muted px-3 py-1 text-[11px] text-muted-foreground">
          {msg.content}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("flex gap-2", isAgent ? "flex-row-reverse" : "flex-row")}>
      {/* Avatar */}
      <div className={cn(
        "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
        isAgent ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
      )}>
        {msg.sender?.name?.charAt(0).toUpperCase() ?? "?"}
      </div>

      <div className={cn("max-w-xs", isAgent && "items-end flex flex-col")}>
        <div className={cn(
          "rounded-xl px-3 py-2 text-sm",
          isAgent
            ? "rounded-tr-sm bg-primary text-primary-foreground"
            : "rounded-tl-sm bg-muted text-foreground"
        )}>
          {msg.content}
        </div>
        <p className={cn(
          "mt-0.5 text-[10px] text-muted-foreground",
          isAgent ? "text-right" : "text-left"
        )}>
          {msg.sender?.name && <span>{msg.sender.name} · </span>}
          {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
}

// ── Create conversation modal ─────────────────────────────────

function CreateConversationModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (conv: Conversation) => void;
}) {
  const [form,     setForm]     = useState({ subject: "", notes: "" });
  const [creating, setCreating] = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const res = await createConversation({
        subject: form.subject || undefined,
        notes:   form.notes   || undefined,
      });
      onCreated(res.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create conversation");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-xl bg-card shadow-xl">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold">New Conversation</h2>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Subject (optional)</label>
            <input
              type="text"
              placeholder="What is this about?"
              value={form.subject}
              onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Notes (optional)</label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              className="resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-border py-2 text-sm hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="flex-1 rounded-lg bg-primary py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {creating ? "Creating…" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
