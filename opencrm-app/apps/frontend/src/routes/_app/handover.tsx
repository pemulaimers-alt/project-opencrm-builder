// Handover Queue (Phase 4 — placeholder shell)
// Real implementation: Phase 5 (handover module)
import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "./-placeholder";
export const Route = createFileRoute("/_app/handover")({ component: HandoverPage });
function HandoverPage() {
  return <PlaceholderPage title="Handover" description="Agent handover queue — connects to /api/handover in Phase 5." phase="Phase 5" />;
}
