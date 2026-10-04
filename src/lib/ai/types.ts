import type { Channel, TemplateId, Tone } from "@/lib/db/schema";
import type { Business } from "@/lib/places/types";
import type { OutreachDraft, SectionId, SectionPatch, SiteContent } from "./schemas";

export type SiteCopyInput = {
  business: Business;
  template: TemplateId;
  tone: Tone;
};

export type SectionCopyInput<S extends SectionId = SectionId> = SiteCopyInput & {
  section: S;
  current: SiteContent;
};

export type OutreachInput = {
  business: Business;
  liveUrl: string;
  operatorName: string;
  channel: Channel;
};

export interface CopyProvider {
  readonly kind: "gemini" | "mock";
  generateSiteContent(input: SiteCopyInput): Promise<SiteContent>;
  regenerateSection<S extends SectionId>(input: SectionCopyInput<S>): Promise<SectionPatch[S]>;
  draftOutreach(input: OutreachInput): Promise<OutreachDraft>;
}

export class AiError extends Error {
  constructor(
    message: string,
    readonly code: "invalid_output" | "provider_error" | "simulated_failure",
  ) {
    super(message);
    this.name = "AiError";
  }
}
