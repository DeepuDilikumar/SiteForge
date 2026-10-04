import type { ReactNode } from "react";

export function BrowserFrame({ url, children }: { url: string; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-bg shadow-1">
      <div className="flex h-10 items-center gap-3 border-b border-border bg-surface px-4">
        <span className="flex gap-2" aria-hidden="true">
          <span className="h-3 w-3 rounded-full bg-border" />
          <span className="h-3 w-3 rounded-full bg-border" />
          <span className="h-3 w-3 rounded-full bg-border" />
        </span>
        <span className="flex h-6 min-w-0 flex-1 items-center rounded-full bg-bg px-3 text-sm text-text-2">
          <span className="truncate">{url}</span>
        </span>
      </div>
      {children}
    </div>
  );
}
