import { createFileRoute, Link } from "@tanstack/react-router";
export const Route = createFileRoute("/terms")({ component: TermsPage });
function TermsPage() {
  return (
    <div className="flex min-h-svh items-center justify-center p-8 text-center">
      <div>
        <h1 className="text-xl font-bold">Terms of Service</h1>
        <p className="mt-2 text-sm text-muted-foreground">Terms content coming soon.</p>
        <Link to="/login" className="mt-4 inline-block text-sm text-primary hover:underline">← Back to Login</Link>
      </div>
    </div>
  );
}
