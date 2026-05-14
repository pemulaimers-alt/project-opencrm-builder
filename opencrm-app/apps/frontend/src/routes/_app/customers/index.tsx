// Customers List (Phase 4 — placeholder shell)
// Real implementation: Phase 5 (connects to /api/customers)
import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "../-placeholder";
export const Route = createFileRoute("/_app/customers/")({ component: CustomersPage });
function CustomersPage() {
  return <PlaceholderPage title="Customers" description="Customer list — connects to /api/customers in Phase 5." phase="Phase 5" />;
}
