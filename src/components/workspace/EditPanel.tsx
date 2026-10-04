"use client";

import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import type { SectionId, SiteContent, SiteOverrides } from "@/lib/ai/schemas";
import type { TemplateId } from "@/lib/db/schema";
import { SidePanel } from "./SidePanel";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export type SaveState = "saved" | "saving" | "unsaved" | { error: string };

type EditPanelProps = {
  content: SiteContent;
  overrides: SiteOverrides;
  template: TemplateId;
  businessPhone: string | null;
  businessHours: string[] | null;
  onContent: (content: SiteContent) => void;
  onOverrides: (overrides: SiteOverrides) => void;
  onRegenerate: (section: SectionId) => void;
  regenerating: SectionId | "all" | null;
  regenerationsLeft: number | null;
  saveState: SaveState;
  onClose: () => void;
};

function Section({
  title,
  section,
  onRegenerate,
  regenerating,
  disabled,
  children,
}: {
  title: string;
  section?: SectionId;
  onRegenerate?: (section: SectionId) => void;
  regenerating?: SectionId | "all" | null;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-border px-4 py-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-text">{title}</h3>
        {section && onRegenerate ? (
          <Button
            variant="text"
            icon="refresh"
            loading={regenerating === section}
            disabled={disabled || Boolean(regenerating)}
            onClick={() => onRegenerate(section)}
          >
            Regenerate
          </Button>
        ) : null}
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}

function saveLabel(state: SaveState) {
  if (state === "saved") return "All changes saved";
  if (state === "saving") return "Saving…";
  if (state === "unsaved") return "Unsaved changes";
  return state.error;
}

export function EditPanel(props: EditPanelProps) {
  const { content, overrides, onContent, onOverrides, regenerating, regenerationsLeft } = props;
  const outOfRegenerations = regenerationsLeft === 0;
  const set = <K extends keyof SiteContent>(key: K, value: SiteContent[K]) => onContent({ ...content, [key]: value });
  const hours = overrides.hours ?? props.businessHours ?? DAYS.map(() => "");
  const sectionProps = { onRegenerate: props.onRegenerate, regenerating, disabled: outOfRegenerations };

  return (
    <SidePanel
      title="Edit text"
      onClose={props.onClose}
      footer={
        <div className="flex items-center justify-between gap-4 text-sm">
          <span className={typeof props.saveState === "object" ? "text-danger" : "text-text-2"} role="status">
            {saveLabel(props.saveState)}
          </span>
          {regenerationsLeft !== null ? (
            <span className="text-text-2">
              {regenerationsLeft} of 3 rewrites left
            </span>
          ) : null}
        </div>
      }
    >
      <Section title="Hero" section="hero" {...sectionProps}>
        <TextField label="Headline" value={content.headline} maxLength={90} onChange={(e) => set("headline", e.target.value)} />
        <TextField
          label="Subheadline"
          multiline
          rows={2}
          textareaProps={{ value: content.subheadline, maxLength: 200, onChange: (e) => set("subheadline", e.target.value) }}
        />
      </Section>

      <Section title="About" section="about" {...sectionProps}>
        <TextField label="Title" value={content.about.title} maxLength={80} onChange={(e) => set("about", { ...content.about, title: e.target.value })} />
        <TextField
          label="Text"
          multiline
          rows={7}
          hint="Leave a blank line between paragraphs."
          textareaProps={{ value: content.about.body, maxLength: 1500, onChange: (e) => set("about", { ...content.about, body: e.target.value }) }}
        />
      </Section>

      {props.template === "legacy" && content.signature ? (
        <Section title="Signature item" section="signature" {...sectionProps}>
          <TextField
            label="Name"
            value={content.signature.title}
            maxLength={80}
            onChange={(e) => content.signature && set("signature", { ...content.signature, title: e.target.value })}
          />
          <TextField
            label="Description"
            multiline
            rows={3}
            textareaProps={{
              value: content.signature.body,
              maxLength: 600,
              onChange: (e) => content.signature && set("signature", { ...content.signature, body: e.target.value }),
            }}
          />
        </Section>
      ) : null}

      <Section title="Services" section="services" {...sectionProps}>
        {content.services.map((service, index) => (
          <div key={index} className="flex flex-col gap-2 rounded-lg bg-surface p-3">
            <TextField
              label={`Service ${index + 1}`}
              value={service.name}
              maxLength={60}
              onChange={(e) => set("services", content.services.map((item, i) => (i === index ? { ...item, name: e.target.value } : item)))}
            />
            <TextField
              label="Description"
              multiline
              rows={2}
              textareaProps={{
                value: service.description,
                maxLength: 240,
                onChange: (e) => set("services", content.services.map((item, i) => (i === index ? { ...item, description: e.target.value } : item))),
              }}
            />
          </div>
        ))}
      </Section>

      <Section title="Call to action" section="cta" {...sectionProps}>
        <TextField label="Headline" value={content.ctaHeadline} maxLength={100} onChange={(e) => set("ctaHeadline", e.target.value)} />
        <TextField label="Button label" value={content.ctaLabel} maxLength={30} onChange={(e) => set("ctaLabel", e.target.value)} />
      </Section>

      <Section title="Contact">
        <TextField
          label="Phone"
          type="tel"
          value={overrides.phone ?? props.businessPhone ?? ""}
          maxLength={32}
          hint="Used for the call button and WhatsApp."
          onChange={(e) => onOverrides({ ...overrides, phone: e.target.value })}
        />
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-sm font-medium text-text">Opening hours</legend>
          {DAYS.map((day, index) => (
            <label key={day} className="flex items-center gap-3">
              <span className="w-24 flex-none text-sm text-text-2">{day}</span>
              <input
                value={hours[index] ?? ""}
                maxLength={60}
                placeholder="Closed"
                onChange={(e) => onOverrides({ ...overrides, hours: hours.map((value, i) => (i === index ? e.target.value : value)) })}
                className="h-10 min-w-0 flex-1 rounded-sm border border-border bg-bg px-3 text-sm text-text hover:border-text-2 focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none"
              />
            </label>
          ))}
        </fieldset>
      </Section>
    </SidePanel>
  );
}
