// Orders (Phase 4 — placeholder shell)
// Real implementation: Phase 5 (commerce module)
import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "./-placeholder";
export const Route = createFileRoute("/_app/orders")({ component: OrdersPage });
function OrdersPage() {
  return <PlaceholderPage title="Orders" description="Order management — connects to /api/orders + /api/commerce in Phase 5." phase="Phase 5" />;
}
