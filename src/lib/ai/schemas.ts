import { z } from "zod";
import { wordCount } from "@/lib/util/text";

const words = (min: number, max: number) =>
  z
    .string()
    .trim()
    .min(1)
    .refine((value) => {
      const count = wordCount(value);
      return count >= min && count <= max;
    }, `Must be ${min === 0 ? `at most ${max}` : `between ${min} and ${max}`} words`);

const text = (max: number) => z.string().trim().min(1).max(max);

export const heroSchema = z.object({
  headline: text(60),
  subheadline: text(140),
});

export const aboutSchema = z.object({
  title: text(60),
  body: words(60, 110),
});

export const signatureSchema = z.object({
  title: text(60),
  body: words(0, 60),
});

export const serviceSchema = z.object({
  name: text(48),
  description: words(0, 25),
});

export const servicesSchema = z.array(serviceSchema).min(3).max(6);

export const reviewHighlightSchema = z.object({
  quote: words(0, 30),
  author: text(40),
});

export const ctaSchema = z.object({
  ctaHeadline: text(80),
  ctaLabel: text(24),
});

export const seoSchema = z.object({
  title: text(60),
  description: text(155),
});

export const siteContentSchema = z.object({
  headline: text(60),
  subheadline: text(140),
  about: aboutSchema,
  signature: signatureSchema.optional(),
  services: servicesSchema,
  reviewHighlights: z.array(reviewHighlightSchema).max(3),
  ctaHeadline: text(80),
  ctaLabel: text(24),
  seo: seoSchema,
});

export type SiteContent = z.infer<typeof siteContentSchema>;

export const SECTION_IDS = ["hero", "about", "signature", "services", "cta"] as const;
export type SectionId = (typeof SECTION_IDS)[number];

export const sectionSchemas = {
  hero: heroSchema,
  about: z.object({ about: aboutSchema }),
  signature: z.object({ signature: signatureSchema }),
  services: z.object({ services: servicesSchema }),
  cta: ctaSchema,
} as const;

export type SectionPatch = {
  hero: z.infer<typeof heroSchema>;
  about: { about: z.infer<typeof aboutSchema> };
  signature: { signature: z.infer<typeof signatureSchema> };
  services: { services: z.infer<typeof servicesSchema> };
  cta: z.infer<typeof ctaSchema>;
};

export const siteOverridesSchema = z.object({
  phone: z.string().trim().max(32).optional(),
  hours: z.array(z.string().trim().max(60)).length(7).optional(),
});

export type SiteOverrides = z.infer<typeof siteOverridesSchema>;

export const whatsappDraftSchema = z.object({
  body: words(50, 80),
});

export const emailDraftSchema = z.object({
  subject: text(50),
  body: words(70, 110),
});

export type OutreachDraft = { subject: string | null; body: string };

export function sectionSchema<S extends SectionId>(section: S): z.ZodType<SectionPatch[S]> {
  return sectionSchemas[section] as unknown as z.ZodType<SectionPatch[S]>;
}

const editable = (max: number) => z.string().trim().min(1, "Can't be empty").max(max, `Keep this under ${max} characters`);

/** Operator edits: same shape as AI output, with length caps but no word-count floors. */
export const siteContentEditSchema = z.object({
  headline: editable(90),
  subheadline: editable(200),
  about: z.object({ title: editable(80), body: editable(1500) }),
  signature: z.object({ title: editable(80), body: editable(600) }).optional(),
  services: z.array(z.object({ name: editable(60), description: editable(240) })).min(1).max(8),
  reviewHighlights: z.array(reviewHighlightSchema).max(3),
  ctaHeadline: editable(100),
  ctaLabel: editable(30),
  seo: z.object({ title: editable(70), description: editable(170) }),
});
