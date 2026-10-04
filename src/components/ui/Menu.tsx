"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

export type MenuItem =
  | { kind?: "item"; label: string; icon?: IconName; onSelect: () => void; disabled?: boolean; trailing?: ReactNode; danger?: boolean }
  | { kind: "divider" }
  | { kind: "header"; content: ReactNode };

type MenuProps = {
  items: MenuItem[];
  align?: "start" | "end";
  trigger: (props: {
    ref: React.Ref<HTMLButtonElement>;
    onClick: () => void;
    onKeyDown: (event: React.KeyboardEvent) => void;
    "aria-haspopup": "menu";
    "aria-expanded": boolean;
    "aria-controls": string;
  }) => ReactNode;
};

/** Menu button with roving focus: arrows move, Enter selects, Esc closes and returns focus. */
export function Menu({ items, trigger, align = "end" }: MenuProps) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const focusables = () =>
    Array.from(listRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not([disabled])') ?? []);

  useEffect(() => {
    if (!open) return;
    focusables()[0]?.focus();
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!listRef.current?.contains(target) && !triggerRef.current?.contains(target)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open]);

  const close = (refocus = true) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  };

  const onListKeyDown = (event: React.KeyboardEvent) => {
    const list = focusables();
    const index = list.indexOf(document.activeElement as HTMLButtonElement);
    if (event.key === "ArrowDown") {
      event.preventDefault();
      list[(index + 1) % list.length]?.focus();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      list[(index - 1 + list.length) % list.length]?.focus();
    } else if (event.key === "Home") {
      event.preventDefault();
      list[0]?.focus();
    } else if (event.key === "End") {
      event.preventDefault();
      list[list.length - 1]?.focus();
    } else if (event.key === "Escape") {
      event.preventDefault();
      close();
    } else if (event.key === "Tab") {
      close(false);
    }
  };

  return (
    <div className="relative">
      {trigger({
        ref: triggerRef,
        onClick: () => setOpen((value) => !value),
        onKeyDown: (event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setOpen(true);
          }
        },
        "aria-haspopup": "menu",
        "aria-expanded": open,
        "aria-controls": menuId,
      })}
      {open ? (
        <div
          ref={listRef}
          id={menuId}
          role="menu"
          onKeyDown={onListKeyDown}
          className={`absolute top-full z-40 mt-1 min-w-[220px] animate-scale-in rounded-sm bg-bg py-2 shadow-2 ${align === "end" ? "right-0" : "left-0"}`}
        >
          {items.map((item, index) => {
            if (item.kind === "divider") return <div key={index} role="separator" className="my-2 h-px bg-border" />;
            if (item.kind === "header") return <div key={index} className="px-4 pt-1 pb-3">{item.content}</div>;
            return (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  close();
                  item.onSelect();
                }}
                className={`flex h-12 w-full items-center gap-3 px-4 text-left text-sm outline-none hover:bg-surface-2 focus-visible:bg-surface-2 disabled:opacity-40 ${item.danger ? "text-danger" : "text-text"}`}
              >
                {item.icon ? <Icon name={item.icon} className={item.danger ? "text-danger" : "text-text-2"} /> : null}
                <span className="flex-1">{item.label}</span>
                {item.trailing}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
