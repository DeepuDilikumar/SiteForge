"use client";

import type { LeadStatus } from "@/lib/db/schema";
import { Icon } from "./Icon";

export const STATUS_LABELS: Record<LeadStatus, string> = {
  site_ready: "Site ready",
  contacted: "Contacted",
  won: "Won",
  lost: "Lost",
};

const STATUS_TONES: Record<LeadStatus, string> = {
  site_ready: "bg-accent-soft text-accent",
  contacted: "bg-warning-soft text-warning",
  won: "bg-success-soft text-success",
  lost: "bg-surface-2 text-text-2",
};

export function StatusChip({ status }: { status: LeadStatus }) {
  return (
    <span className={`inline-flex h-6 items-center rounded-full px-2 text-sm font-medium ${STATUS_TONES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

type StatusSelectProps = {
  value: LeadStatus;
  onChange: (status: LeadStatus) => void;
  label: string;
  disabled?: boolean;
};

/** Inline pipeline status picker; a native select so it works with every input method. */
export function StatusSelect({ value, onChange, label, disabled }: StatusSelectProps) {
  return (
    <span className={`relative inline-flex h-8 items-center rounded-full ${STATUS_TONES[value]}`}>
      <select
        aria-label={label}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value as LeadStatus)}
        onClick={(event) => event.stopPropagation()}
        className="h-8 cursor-pointer appearance-none rounded-full bg-transparent pr-8 pl-3 text-sm font-medium text-inherit outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-default"
      >
        {(Object.keys(STATUS_LABELS) as LeadStatus[]).map((status) => (
          <option key={status} value={status} className="bg-bg text-text">
            {STATUS_LABELS[status]}
          </option>
        ))}
      </select>
      <Icon name="expand_more" size={18} className="pointer-events-none absolute right-2" />
    </span>
  );
}
