// Flows / Workflow (Phase 4 — placeholder shell)
// Real implementation: Phase 5 (flow builder)
import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "./-placeholder";
export const Route = createFileRoute("/_app/flows")({ component: FlowsPage });
function FlowsPage() {
  return <PlaceholderPage title="Workflow" description="Visual flow builder — connects to /api/flows in Phase 5." phase="Phase 5" />;
}
