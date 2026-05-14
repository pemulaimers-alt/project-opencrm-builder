// Broadcast (Phase 4 — placeholder shell)
// Real implementation: Phase 5 (broadcast module)
import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "./-placeholder";
export const Route = createFileRoute("/_app/broadcast")({ component: BroadcastPage });
function BroadcastPage() {
  return <PlaceholderPage title="Broadcast" description="Campaign broadcasts — connects to /api/broadcasts in Phase 5." phase="Phase 5" />;
}
