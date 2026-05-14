// Settings (Phase 4 — placeholder shell)
// Real implementation: Phase 5 (settings hub)
import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "./-placeholder";
export const Route = createFileRoute("/_app/settings")({ component: SettingsPage });
function SettingsPage() {
  return <PlaceholderPage title="Settings" description="Multi-tab settings hub — AI, WhatsApp, labels, SLA, contacts, auto-assign." phase="Phase 5" />;
}
