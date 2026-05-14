// AI Agents list (Phase 4 — placeholder shell)
// Real implementation: Phase 5 (AI agents / chatbot module)
import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "../-placeholder";
export const Route = createFileRoute("/_app/ai-agents/")({ component: AiAgentsPage });
function AiAgentsPage() {
  return <PlaceholderPage title="AI Agents" description="AI agent personas — connects to /api/chatbots in Phase 5." phase="Phase 5" />;
}
