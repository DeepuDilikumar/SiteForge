import type { SiteContent, SiteOverrides } from "@/lib/ai/schemas";
import type { LeadStatus, TemplateId, Tone } from "@/lib/db/schema";

export type WorkspaceSite = {
  id: string;
  template: TemplateId;
  tone: Tone;
  accent: string;
  content: SiteContent;
  overrides: SiteOverrides;
  regenerationsUsed: number;
  publishedUrl: string | null;
  updatedAt: string;
};

export type WorkspaceBusiness = {
  id: string;
  recommendedTemplate: TemplateId;
  name: string;
  city: string;
  category: string;
  phone: string | null;
  hours: string[] | null;
};

export type WorkspaceLead = { id: string; status: LeadStatus };

export type WorkspacePlan = {
  isPro: boolean;
  canPublish: boolean;
  canExport: boolean;
  canDraftOutreach: boolean;
  regenerationsLeft: number | null;
};

export type Device = "desktop" | "mobile";
