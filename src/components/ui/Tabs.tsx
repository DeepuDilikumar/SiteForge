"use client";

import { useRef } from "react";

export type TabItem<T extends string> = { id: T; label: string; count?: number };

type TabsProps<T extends string> = {
  items: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  className?: string;
};

/** Segmented pill tabs on a soft track, with arrow-key navigation. */
export function Tabs<T extends string>({ items, value, onChange, label, className = "" }: TabsProps<T>) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  const onKeyDown = (event: React.KeyboardEvent, index: number) => {
    const delta = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!delta) return;
    event.preventDefault();
    const next = (index + delta + items.length) % items.length;
    refs.current[next]?.focus();
    onChange(items[next].id);
  };

  return (
    <div className={`max-w-full overflow-x-auto ${className}`}>
      <div role="tablist" aria-label={label} className="inline-flex gap-1 rounded-full bg-surface-2 p-1">
        {items.map((item, index) => {
          const selected = item.id === value;
          return (
            <button
              key={item.id}
              ref={(element) => {
                refs.current[index] = element;
              }}
              type="button"
              role="tab"
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(item.id)}
              onKeyDown={(event) => onKeyDown(event, index)}
              className={`flex h-9 flex-none items-center gap-2 rounded-full px-4 text-sm font-medium transition-[background-color,color,box-shadow] duration-200 ease-standard ${
                selected ? "bg-bg text-text shadow-1" : "text-text-2 hover:text-text"
              }`}
            >
              {item.label}
              {item.count !== undefined ? (
                <span className={`text-sm tabular-nums ${selected ? "text-text-2" : "text-text-2/80"}`}>{item.count}</span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
