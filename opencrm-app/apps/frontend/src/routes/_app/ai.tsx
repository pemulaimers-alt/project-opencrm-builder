// AI Playground (Phase 4 — placeholder shell)
// Real implementation: Phase 5 (AI module)
import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "./-placeholder";
export const Route = createFileRoute("/_app/ai")({ component: AiPage });
function AiPage() {
  return <PlaceholderPage title="AI Playground" description="AI provider configuration + playground — connects to /api/ai in Phase 5." phase="Phase 5" />;
}
