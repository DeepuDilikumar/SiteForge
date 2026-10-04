"use client";

import { useId, type ComponentProps, type ReactNode } from "react";

type FieldProps = {
  label: string;
  error?: string;
  hint?: ReactNode;
  multiline?: boolean;
  rows?: number;
} & Omit<ComponentProps<"input">, "id"> & { textareaProps?: ComponentProps<"textarea"> };

const control =
  "w-full rounded-sm border bg-bg px-3 text-base text-text placeholder:text-text-2 transition-[border-color,box-shadow] duration-200 ease-standard " +
  "hover:border-text-2 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50";

export function TextField({ label, error, hint, multiline, rows = 4, className = "", textareaProps, ...inputProps }: FieldProps) {
  const id = useId();
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-text">
        {label}
      </label>
      {multiline ? (
        <textarea
          id={id}
          rows={rows}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          className={`${control} resize-y py-2 leading-6 ${error ? "border-danger" : "border-border"}`}
          {...textareaProps}
        />
      ) : (
        <input
          id={id}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          className={`${control} h-12 ${error ? "border-danger" : "border-border"}`}
          {...inputProps}
        />
      )}
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-sm text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1 text-sm text-text-2">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
