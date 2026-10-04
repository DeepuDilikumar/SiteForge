"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { IconButton } from "@/components/ui/Button";

/** Right-side panel. Full screen on phones. Esc closes it and focus returns to the opener. */
export function SidePanel({ title, onClose, children, footer }: { title: string; onClose: () => void; children: ReactNode; footer?: ReactNode }) {
  const panel = useRef<HTMLElement>(null);
  const opener = useRef<Element | null>(null);

  useEffect(() => {
    opener.current = document.activeElement;
    panel.current?.querySelector<HTMLElement>("input, textarea, button:not([data-close])")?.focus();
    return () => {
      if (opener.current instanceof HTMLElement) opener.current.focus();
    };
  }, []);

  return (
    <aside
      ref={panel}
      aria-label={title}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          onClose();
        }
      }}
      className="fixed inset-0 z-30 flex animate-slide-in-right flex-col bg-bg md:static md:inset-auto md:z-auto md:w-[420px] md:flex-none md:border-l md:border-border"
    >
      <div className="flex h-14 flex-none items-center justify-between border-b border-border pr-2 pl-4">
        <h2 className="text-base font-medium text-text">{title}</h2>
        <IconButton icon="close" label={`Close ${title.toLowerCase()}`} onClick={onClose} data-close />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      {footer ? <div className="flex-none border-t border-border px-4 py-3">{footer}</div> : null}
    </aside>
  );
}
