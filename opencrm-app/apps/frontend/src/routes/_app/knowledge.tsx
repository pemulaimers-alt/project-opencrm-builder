// Knowledge Base (Phase 4 — placeholder shell)
// Real implementation: Phase 5 (knowledge/RAG module)
import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "./-placeholder";
export const Route = createFileRoute("/_app/knowledge")({ component: KnowledgePage });
function KnowledgePage() {
  return <PlaceholderPage title="Knowledge Base" description="Knowledge sources + RAG — connects to /api/knowledge in Phase 5." phase="Phase 5" />;
}
