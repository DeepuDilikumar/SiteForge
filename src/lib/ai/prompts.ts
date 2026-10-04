import type { Channel, TemplateId, Tone } from "@/lib/db/schema";
import type { Business } from "@/lib/places/types";
import type { SectionId, SiteContent } from "./schemas";

const TEMPLATE_TONE: Record<TemplateId, string> = {
  legacy: "warm and unhurried, story-led, like a neighbour describing a place they trust",
  modern: "clear, reassuring and direct, leading with practical facts",
  bold: "confident, with short sentences and a strong point of view",
};

const TONE_NOTE: Record<Tone, string> = {
  warm: "Lean warm and personal.",
  professional: "Lean measured and professional.",
  bold: "Lean punchy and confident.",
};

function marketNote(business: Business): string {
  switch (business.countryCode) {
    case "IN":
      return "Write in Indian English for readers in India (e.g. 'neighbourhood', 'colour', local place names as given).";
    case "GB":
      return "Write in British English.";
    case "AU":
      return "Write in Australian English.";
    case "US":
      return "Write in American English.";
  }
}

export const SITE_COPY_SYSTEM = `You are writing website copy for a real local business. The site will be shown to the owner and their customers, mostly on phones.

Rules:
- Use ONLY the facts provided: name, category, city, address, rating, review count, review texts and opening hours.
- Never invent facts. Do not mention founding years, "family-owned since", generations, awards, certifications, prices, offers, staff names, delivery promises, response times or service guarantees unless they appear in the provided data. When something is not known, write copy that does not assert it.
- Review highlights must be trimmed, word-for-word excerpts of the provided reviews. Do not paraphrase, merge or invent quotes. Attribute each with the reviewer's first name and last initial, e.g. "Anjali M.".
- Services: infer typical services for this category and phrase them generally (e.g. "Leak repairs", not "24/7 emergency service in 30 minutes").
- No clichés ("look no further", "one-stop shop", "we pride ourselves", "best in town", "second to none"). No exclamation marks. No emojis. Sentence case for headings.
- Return only JSON that matches the requested shape. No markdown, no commentary.`;

export const SITE_CONTENT_SHAPE = `{
  "headline": string, at most 60 characters,
  "subheadline": string, at most 140 characters,
  "about": { "title": string, "body": string of 60 to 110 words },
  "signature": { "title": string, "body": string of at most 60 words },  // the one thing this place is known for, drawn from the reviews or the category
  "services": array of 3 to 6 { "name": string, "description": string of at most 25 words },
  "reviewHighlights": array of 0 to 3 { "quote": string of at most 30 words copied from one review, "author": string },
  "ctaHeadline": string, at most 80 characters,
  "ctaLabel": string, at most 24 characters (e.g. "Call to order", "Book a visit"),
  "seo": { "title": string, at most 60 characters, "description": string, at most 155 characters }
}`;

export function businessFacts(business: Business) {
  return {
    name: business.name,
    category: business.category,
    city: business.city,
    address: business.address,
    rating: business.rating,
    reviewCount: business.reviewCount,
    reviews: business.reviews.map((review) => ({ author: review.author, rating: review.rating, text: review.text })),
    openingHours: business.hours
      ? ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(
          (day, index) => `${day}: ${business.hours?.[index] ?? ""}`,
        )
      : "not provided",
  };
}

export function siteCopyPrompt(business: Business, template: TemplateId, tone: Tone): string {
  return [
    `Write the website copy for this business. Tone: ${TEMPLATE_TONE[template]}. ${TONE_NOTE[tone]}`,
    marketNote(business),
    `Business facts (JSON):\n${JSON.stringify(businessFacts(business), null, 2)}`,
    `Return JSON with exactly this shape:\n${SITE_CONTENT_SHAPE}`,
  ].join("\n\n");
}

const SECTION_SHAPES: Record<SectionId, string> = {
  hero: `{ "headline": string, at most 60 characters, "subheadline": string, at most 140 characters }`,
  about: `{ "about": { "title": string, "body": string of 60 to 110 words } }`,
  signature: `{ "signature": { "title": string, "body": string of at most 60 words } }`,
  services: `{ "services": array of 3 to 6 { "name": string, "description": string of at most 25 words } }`,
  cta: `{ "ctaHeadline": string, at most 80 characters, "ctaLabel": string, at most 24 characters }`,
};

export function sectionPrompt(
  business: Business,
  template: TemplateId,
  tone: Tone,
  section: SectionId,
  current: SiteContent,
): string {
  return [
    `Rewrite only the "${section}" section of this business's website. Offer a fresh angle that differs from the current version. Tone: ${TEMPLATE_TONE[template]}. ${TONE_NOTE[tone]}`,
    marketNote(business),
    `Business facts (JSON):\n${JSON.stringify(businessFacts(business), null, 2)}`,
    `Current site copy (JSON), for context and to avoid repeating it:\n${JSON.stringify(current, null, 2)}`,
    `Return JSON with exactly this shape:\n${SECTION_SHAPES[section]}`,
  ].join("\n\n");
}

export const OUTREACH_SYSTEM = `You write short, honest first messages from a freelance web designer to a local business owner.

Rules:
- Structure: greet the business by name; make one genuine, specific observation (for example their rating and number of reviews, and that people searching online can't find a website for them); say "I built a website for you, here it is: {link}" using the exact link given; end with one simple, no-pressure question such as "Would you like to keep it?".
- No hype, no fake urgency, no discounts or prices, no exclamation marks, no emojis.
- Never claim or imply that the sender works for or with Google.
- Sign off with the sender's first name.
- Return only JSON that matches the requested shape.`;

export function outreachPrompt(input: {
  business: Business;
  liveUrl: string;
  operatorName: string;
  channel: Channel;
}): string {
  const { business, liveUrl, operatorName, channel } = input;
  const shape =
    channel === "whatsapp"
      ? `{ "body": string of 50 to 80 words }`
      : `{ "subject": string, at most 50 characters, "body": string of 70 to 110 words }`;
  return [
    `Channel: ${channel === "whatsapp" ? "WhatsApp message" : "Email"}.`,
    marketNote(business),
    `Facts (JSON):\n${JSON.stringify(
      {
        businessName: business.name,
        category: business.category,
        city: business.city,
        rating: business.rating,
        reviewCount: business.reviewCount,
        hasWebsite: business.websiteStatus === "has_site",
        onlySocialPage: business.websiteStatus === "social_only",
        liveLink: liveUrl,
        senderName: operatorName,
      },
      null,
      2,
    )}`,
    `Return JSON with exactly this shape:\n${shape}`,
  ].join("\n\n");
}
