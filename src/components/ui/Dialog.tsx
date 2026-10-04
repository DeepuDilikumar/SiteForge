"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { IconButton } from "./Button";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  size?: "sm" | "md" | "lg";
};

/**
 * Modal dialog on the native <dialog> element: focus is trapped, Esc closes,
 * and focus returns to the element that opened it.
 */
export function Dialog({ open, onClose, title, description, children, actions, size = "sm" }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const returnFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      returnFocus.current = document.activeElement as HTMLElement | null;
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
      returnFocus.current?.focus();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      className={`m-auto w-[calc(100%-32px)] ${size === "sm" ? "max-w-[440px]" : size === "md" ? "max-w-[560px]" : "max-w-[960px]"} rounded-lg bg-bg p-0 text-text shadow-2 backdrop:bg-scrim open:animate-scale-in backdrop:animate-fade-in`}
    >
      {open ? (
        <div className="relative p-6">
          <IconButton icon="close" label="Close" onClick={onClose} className="absolute top-3 right-3" />
          <h2 id={titleId} className="pr-12 text-xl font-normal text-text">
            {title}
          </h2>
          {description ? (
            <div id={descriptionId} className="mt-2 text-sm text-text-2">
              {description}
            </div>
          ) : null}
          {children ? <div className="mt-6">{children}</div> : null}
          {actions ? <div className="mt-6 flex flex-wrap-reverse justify-end gap-2">{actions}</div> : null}
        </div>
      ) : null}
    </dialog>
  );
}
