import type { ComponentProps, ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

type ChipProps = {
  selected?: boolean;
  icon?: IconName;
  children: ReactNode;
} & Omit<ComponentProps<"button">, "children">;

/** Filter or suggestion chip: an outlined pill that fills softly when selected. */
export function Chip({ selected = false, icon, children, className = "", ...rest }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={`inline-flex h-9 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors duration-200 ease-standard focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
        selected
          ? "border-ink bg-ink text-on-ink"
          : "border-border text-text-2 hover:border-text-2 hover:text-text"
      } ${className}`}
      {...rest}
    >
      {selected ? <Icon name="check" size={18} /> : icon ? <Icon name={icon} size={18} /> : null}
      {children}
    </button>
  );
}

type BadgeTone = "neutral" | "strong" | "warning" | "muted" | "success" | "accent";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-surface-2 text-text-2",
  strong: "bg-text text-bg",
  warning: "bg-warning-soft text-warning",
  muted: "bg-surface text-text-2 border border-border",
  success: "bg-success-soft text-success",
  accent: "bg-accent-soft text-accent",
};

/** Non-interactive label, e.g. website status or plan. */
export function Badge({ tone = "neutral", icon, children, className = "" }: { tone?: BadgeTone; icon?: IconName; children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex h-6 items-center gap-1 rounded-full px-2 text-sm font-medium whitespace-nowrap ${tones[tone]} ${className}`}>
      {icon ? <Icon name={icon} size={16} /> : null}
      {children}
    </span>
  );
}
