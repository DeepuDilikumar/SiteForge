"use client";

import { ScaledFrame } from "@/components/ScaledFrame";
import type { TemplateId } from "@/lib/db/schema";

export const TEMPLATE_INFO: Array<{ id: TemplateId; name: string; description: string }> = [
  { id: "legacy", name: "Legacy", description: "Heritage and story-led. For family businesses, food and old trades." },
  { id: "modern", name: "Modern", description: "Trust signals first, tap to call. For trades, clinics and services." },
  { id: "bold", name: "Bold", description: "Editorial and confident. For cafés, boutiques, studios and gyms." },
];

type TemplatePickerProps = {
  businessId: string;
  value: TemplateId;
  recommended: TemplateId;
  accent: string;
  onChange: (template: TemplateId) => void;
};

export function TemplatePicker({ businessId, value, recommended, accent, onChange }: TemplatePickerProps) {
  return (
    <div role="radiogroup" aria-label="Template" className="mt-6 grid gap-4 md:grid-cols-3">
      {TEMPLATE_INFO.map((template) => {
        const selected = template.id === value;
        return (
          <button
            key={template.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(template.id)}
            onKeyDown={(event) => {
              const index = TEMPLATE_INFO.findIndex((item) => item.id === value);
              const delta = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 0;
              if (!delta) return;
              event.preventDefault();
              onChange(TEMPLATE_INFO[(index + delta + TEMPLATE_INFO.length) % TEMPLATE_INFO.length].id);
            }}
            tabIndex={selected ? 0 : -1}
            className={`group overflow-hidden rounded-xl border text-left transition-[border-color,box-shadow] duration-200 ease-standard ${
              selected ? "border-ink shadow-[0_0_0_1px_var(--ink)]" : "border-border hover:border-text-2"
            }`}
          >
            <ScaledFrame
              src={`/api/businesses/${businessId}/thumbnail?${new URLSearchParams({ template: template.id, accent })}`}
              title={`${template.name} template preview`}
              viewportWidth={1280}
              aspect={0.68}
              className="border-b border-border"
            />
            <div className="flex items-start gap-3 p-4">
              <span
                aria-hidden="true"
                className={`mt-[2px] flex h-5 w-5 flex-none items-center justify-center rounded-full border-2 ${selected ? "border-ink" : "border-text-2"}`}
              >
                {selected ? <span className="h-[10px] w-[10px] rounded-full bg-ink" /> : null}
              </span>
              <span className="min-w-0">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-base font-medium text-text">{template.name}</span>
                  {template.id === recommended ? (
                    <span className="rounded-full bg-accent-soft px-2 text-sm leading-6 font-medium text-accent">Recommended</span>
                  ) : null}
                </span>
                <span className="mt-1 block text-sm text-text-2">{template.description}</span>
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
