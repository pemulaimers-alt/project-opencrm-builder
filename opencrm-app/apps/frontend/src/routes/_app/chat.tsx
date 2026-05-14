// Inbox / Live Chat (Phase 4 — placeholder shell)
// Real implementation: Phase 5 (requires Socket.IO + conversations API)
import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "./-placeholder";
export const Route = createFileRoute("/_app/chat")({ component: ChatPage });
function ChatPage() {
  return <PlaceholderPage title="Inbox" description="Live agent inbox — connects to conversations API + Socket.IO in Phase 5." phase="Phase 5" />;
}
