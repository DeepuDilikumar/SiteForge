"use client";

import { Icon } from "@/components/ui/Icon";
import { ACCENT_SWATCHES, type AccentColor } from "@/lib/categories";
import type { Tone } from "@/lib/db/schema";

const TONES: Array<{ id: Tone; label: string }> = [
  { id: "warm", label: "Warm" },
  { id: "professional", label: "Professional" },
  { id: "bold", label: "Bold" },
];

type CustomizeProps = {
  accent: AccentColor;
  recommendedAccent: AccentColor;
  tone: Tone;
  onAccent: (accent: AccentColor) => void;
  onTone: (tone: Tone) => void;
};

export function Customize({ accent, recommendedAccent, tone, onAccent, onTone }: CustomizeProps) {
  return (
    <details className="group mt-8 rounded-xl border border-border">
      <summary className="flex h-14 cursor-pointer list-none items-center gap-3 rounded-xl px-4 text-base text-text hover:bg-surface [&::-webkit-details-marker]:hidden">
        <Icon name="tune" className="text-text-2" />
        Customize
        <span className="text-sm text-text-2">Colour and tone</span>
        <Icon name="expand_more" className="ml-auto text-text-2 transition-transform duration-200 ease-standard group-open:rotate-180" />
      </summary>
      <div className="grid gap-8 border-t border-border p-4 sm:grid-cols-2 sm:p-6">
        <fieldset>
          <legend className="text-sm font-medium text-text">Accent colour</legend>
          <div className="mt-3 flex flex-wrap gap-3">
            {ACCENT_SWATCHES.map((swatch) => {
              const selected = swatch.value === accent;
              const recommended = swatch.value === recommendedAccent;
              return (
                <label key={swatch.value} className="flex flex-col items-center gap-1">
                  <input
                    type="radio"
                    name="accent"
                    value={swatch.value}
                    checked={selected}
                    onChange={() => onAccent(swatch.value)}
                    className="peer sr-only"
                  />
                  <span
                    title={`${swatch.name}${recommended ? " (recommended)" : ""}`}
                    style={{ backgroundColor: swatch.value }}
                    className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-full ring-offset-2 ring-offset-bg transition-shadow duration-200 ease-standard peer-focus-visible:ring-2 peer-focus-visible:ring-accent ${
                      selected ? "ring-2 ring-ink" : ""
                    }`}
                  >
                    {selected ? <Icon name="check" className="text-white" /> : null}
                  </span>
                  <span className="sr-only">{swatch.name}</span>
                  <span className={`text-sm ${recommended ? "text-text-2" : "invisible"}`} aria-hidden={!recommended}>
                    Rec.
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
        <fieldset>
          <legend className="text-sm font-medium text-text">Tone of the copy</legend>
          <div className="mt-3 inline-flex gap-1 rounded-full bg-surface-2 p-1">
            {TONES.map((item) => (
              <label key={item.id}>
                <input
                  type="radio"
                  name="tone"
                  value={item.id}
                  checked={tone === item.id}
                  onChange={() => onTone(item.id)}
                  className="peer sr-only"
                />
                <span className="flex h-9 cursor-pointer items-center rounded-full px-4 text-sm font-medium text-text-2 transition-colors duration-200 ease-standard peer-checked:bg-bg peer-checked:text-text peer-checked:shadow-1 peer-focus-visible:outline-2 peer-focus-visible:outline-accent hover:text-text">
                  {item.label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>
    </details>
  );
}
