// Products (Phase 4 — placeholder shell)
// Real implementation: Phase 5 (commerce module)
import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "./-placeholder";
export const Route = createFileRoute("/_app/products")({ component: ProductsPage });
function ProductsPage() {
  return <PlaceholderPage title="Products" description="Product catalog — connects to /api/commerce/products in Phase 5." phase="Phase 5" />;
}
