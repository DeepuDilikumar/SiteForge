import type { SiteContent } from "@/lib/ai/schemas";
import type { TemplateId } from "@/lib/db/schema";
import type { Business } from "@/lib/places/types";

export type TemplateOptions = {
  accent: string;
  /** Absolute URL the page will be served from, used for canonical and Open Graph tags. */
  canonicalUrl?: string;
};

export type TemplateRender = (content: SiteContent, business: Business, opts: TemplateOptions) => string;

export type TemplateDefinition = {
  id: TemplateId;
  name: string;
  description: string;
  render: TemplateRender;
};
