// =============================================================
// Shared placeholder component for Phase 4 shell pages.
// The leading dash (-) prefix prevents TanStack Router from
// treating this as a route file.
// =============================================================

import { Construction } from "lucide-react";

interface Props {
  title: string;
  description: string;
  phase?: string;
}

export function PlaceholderPage({ title, description, phase = "Phase 5" }: Props) {
  return (
    <main className="ocm-page">
      <div>
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-card/50 py-20 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
          <Construction size={22} className="text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">{description}</p>
        </div>
        <span className="rounded-full border border-border bg-muted px-3 py-1 text-[11px] font-medium text-muted-foreground">
          Coming in {phase}
        </span>
      </div>
    </main>
  );
}
