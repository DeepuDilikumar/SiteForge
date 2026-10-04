import { categoryGroup, type CategoryGroup } from "@/lib/categories";
import type { TemplateId, Tone } from "@/lib/db/schema";
import type { Business } from "@/lib/places/types";
import { createRng, type Rng } from "@/lib/util/random";
import { fitLength, sentenceCase, wordCount } from "@/lib/util/text";
import { areaName, namedItem, openDaysPhrase, pickReviewHighlights, reviewThemes } from "./copy-facts";
import { servicesFor } from "./service-bank";
import {
  emailDraftSchema,
  sectionSchema,
  siteContentSchema,
  whatsappDraftSchema,
  type OutreachDraft,
  type SectionId,
  type SectionPatch,
  type SiteContent,
} from "./schemas";
import type { CopyProvider, OutreachInput, SectionCopyInput, SiteCopyInput } from "./types";

type Facts = {
  name: string;
  label: string;
  area: string;
  city: string;
  place: string;
  rating: number | null;
  reviewCount: number;
  themes: string[];
  item: string | null;
  openPhrase: string | null;
  isIndia: boolean;
  group: CategoryGroup;
  craft: string;
  people: string;
};

const CRAFTS: Array<[RegExp, string]> = [
  [/bak|cake/i, "baking"],
  [/restaurant|meals|kitchen|biryani|eatery|thali/i, "cooking"],
  [/caf|coffee|roast/i, "coffee"],
  [/plumb/i, "plumbing work"],
  [/electric/i, "electrical work"],
  [/mechanic|auto|car|garage|motor/i, "car care"],
  [/dent/i, "dental care"],
  [/salon|parlou?r|beauty|hair|barber|spa/i, "hair and beauty care"],
  [/gym|fitness|yoga/i, "training"],
  [/tailor/i, "tailoring"],
  [/florist|flower/i, "flowers"],
  [/photo/i, "photography"],
];

const PEOPLE: Partial<Record<CategoryGroup, string>> = {
  health: "patients",
  beauty: "clients",
  studio: "clients",
  food: "customers",
  cafe: "regulars",
};

function factsFor(business: Business): Facts {
  const group = categoryGroup(business.category);
  const area = areaName(business);
  const label = labelNoun(business.category.toLowerCase());
  return {
    name: business.name,
    label,
    area,
    city: business.city,
    place: area === business.city ? business.city : `${area}, ${business.city}`,
    rating: business.rating,
    reviewCount: business.reviewCount,
    themes: reviewThemes(business.reviews),
    item: namedItem(business.reviews),
    openPhrase: openDaysPhrase(business),
    isIndia: business.countryCode === "IN",
    group,
    craft: CRAFTS.find(([pattern]) => pattern.test(business.category))?.[1] ?? `${label} services`,
    people: PEOPLE[group] ?? "customers",
  };
}

function labelNoun(label: string): string {
  return /(repair|care|services?)$/.test(label) ? `${label} shop` : label;
}

function plural(noun: string): string {
  if (/[^aeiou]y$/.test(noun)) return `${noun.slice(0, -1)}ies`;
  if (/(s|sh|ch|x)$/.test(noun)) return `${noun}es`;
  return `${noun}s`;
}

function article(word: string): string {
  return /^[aeiou]/i.test(word) ? "an" : "a";
}

function ratingLine(f: Facts): string | null {
  if (!f.rating || f.reviewCount < 1) return null;
  return `rated ${f.rating.toFixed(1)} from ${f.reviewCount} reviews`;
}

function listPhrase(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

function heroFor(f: Facts, template: TemplateId, tone: Tone, rng: Rng): SectionPatch["hero"] {
  const rated = ratingLine(f);
  const byTemplate: Record<TemplateId, string[]> = {
    legacy: [
      `Good ${f.craft} in the heart of ${f.area}`,
      `${sentenceCase(f.craft)} the way ${f.area} likes it`,
      `${sentenceCase(article(f.area))} ${f.area} ${f.label} worth the visit`,
      `${sentenceCase(f.craft)} you can count on in ${f.city}`,
    ],
    modern: [
      `${sentenceCase(f.label)} in ${f.area} you can rely on`,
      `Trusted ${f.craft} in ${f.area}`,
      `${sentenceCase(f.craft)} in ${f.city}, done properly`,
      `Your ${f.label} in ${f.area}`,
    ],
    bold: [
      `${sentenceCase(f.craft)}. ${f.area}.`,
      `${sentenceCase(f.craft)}, done right.`,
      `Made for ${f.area}.`,
      `${f.area}'s ${f.label}.`,
    ],
  };
  const headlines = rng.shuffle(byTemplate[template]);
  const themeText = f.themes.length ? `known for ${listPhrase(f.themes.slice(0, 2))}` : null;
  const subs = [
    rated && themeText ? `${f.name} is ${rated}, ${themeText}.` : null,
    rated ? `${f.name} in ${f.place}, ${rated}.` : null,
    tone === "warm" ? `Drop by ${f.name} in ${f.place}, or give us a call before you come.` : null,
    tone === "bold" ? `${f.name}. ${sentenceCase(f.place)}. Call or walk in.` : null,
    `${f.name} is ${article(f.label)} ${f.label} in ${f.place}.`,
  ].filter((value): value is string => Boolean(value));
  return {
    headline: fitLength(headlines, 60),
    subheadline: fitLength(rng.next() < 0.5 ? subs : [...subs].reverse(), 140),
  };
}

const GROUP_MIDDLE: Record<CategoryGroup, string[]> = {
  food: [
    "Come in for something quick, or call ahead if you are ordering for a family occasion or an office.",
    "The menu covers everyday favourites as well as orders for celebrations, and it is worth asking what is fresh today.",
  ],
  heritage: [
    "Work is made to your requirements, and it is worth talking through what you need before you order.",
    "Bring in what you have in mind and ask for advice on materials and design.",
  ],
  cafe: [
    "It is a place to slow down with a good cup, meet a friend or get some work done.",
    "Pull up a chair, order something warm or cold, and stay as long as you like.",
  ],
  trade: [
    "Call to describe the problem, and you will get a clear idea of what the job involves before any work begins.",
    "From small repairs to new installations, jobs are explained before they start so there are no surprises.",
  ],
  health: [
    "Each visit starts with a proper conversation about your concern, and the options are explained before any treatment.",
    "Treatment is explained clearly, so you know what is happening and why at every step.",
  ],
  beauty: [
    "Tell the stylist what you have in mind and you will get honest advice on what suits you.",
    "Whether it is a quick trim or preparation for a big day, appointments are unhurried and careful.",
  ],
  retail: [
    "Take your time looking around, and ask for help if you are hunting for something specific.",
    "It is the kind of shop where you can ask questions and get a straight answer.",
  ],
  fitness: [
    "Whether you are just starting out or returning to training, you can begin at your own pace.",
    "Come in, look around and ask how to get started.",
  ],
  studio: [
    "Every project starts with a conversation about what you have in mind.",
    "Get in touch with your idea, and it will be shaped with you rather than for you.",
  ],
  general: [
    "Call ahead with any questions, or simply drop in during opening hours.",
    "You can ask questions over the phone before you visit.",
  ],
};

function aboutFor(f: Facts, tone: Tone, rng: Rng): SectionPatch["about"] {
  const rated = ratingLine(f);
  const opening =
    tone === "bold"
      ? `${f.name} is ${article(f.label)} ${f.label} in ${f.place}. No fuss, just good ${f.craft}.`
      : `${f.name} is ${article(f.label)} ${f.label} in ${f.place}.`;
  const sentences = [
    opening,
    rated
      ? `${f.people.charAt(0).toUpperCase() + f.people.slice(1)} have ${rated.replace("rated", "rated it")}${
          f.themes.length ? `, and they keep mentioning ${listPhrase(f.themes.slice(0, 2))}` : ""
        }.`
      : null,
    rng.pick(GROUP_MIDDLE[f.group]),
    f.item ? `If it is your first time, reviewers point to the ${f.item}.` : null,
    f.openPhrase ? `${f.name} is ${f.openPhrase}; the full hours are listed below.` : "Opening hours and directions are listed below.",
    `You will find the address, a map link and a number to call further down this page.`,
    `Read a few words from ${f.people} below, then call or visit when it suits you.`,
  ].filter((value): value is string => Boolean(value));

  let body = "";
  for (const sentence of sentences) {
    const next = `${body} ${sentence}`.trim();
    if (wordCount(next) > 110) break;
    body = next;
    if (wordCount(body) >= 75) break;
  }
  const titles =
    tone === "bold"
      ? [`About ${f.name}`, "The short version"]
      : [`About ${f.name}`, `Welcome to ${f.name}`, `A ${f.label} in ${f.area}`];
  return { about: { title: fitLength(rng.shuffle(titles), 60), body } };
}

function signatureFor(f: Facts, business: Business, rng: Rng): SectionPatch["signature"] {
  if (f.item) {
    const mentions = business.reviews.filter((review) => review.text.toLowerCase().includes(f.item ?? "")).length;
    const isPlural = /[^s]s$/.test(f.item) || f.item.includes(" and ");
    const it = isPlural ? "them" : "it";
    const itIs = isPlural ? "they are" : "it is";
    return {
      signature: {
        title: sentenceCase(f.item),
        body:
          mentions > 1
            ? `The ${f.item} ${isPlural ? "come" : "comes"} up again and again in reviews. Ask for ${it} when you visit, or call ahead to make sure ${itIs} ready.`
            : `Reviewers single out the ${f.item}. Ask for ${it} when you visit, or call ahead to check ${itIs} available.`,
      },
    };
  }
  const services = servicesFor(business.category, f.group, f.isIndia);
  const pick = rng.pick(services);
  return {
    signature: {
      title: pick.name,
      body: `${pick.description} Ask about it when you call or visit ${f.name}.`,
    },
  };
}

function servicesSection(f: Facts, business: Business, rng: Rng): SectionPatch["services"] {
  const services = servicesFor(business.category, f.group, f.isIndia);
  const count = Math.min(services.length, rng.int(4, 6));
  const ordered = [services[0], ...rng.shuffle(services.slice(1))].slice(0, Math.max(3, count));
  return { services: ordered.map(({ name, description }) => ({ name, description })) };
}

const CTA_BY_GROUP: Record<CategoryGroup, { headlines: (f: Facts) => string[]; labels: string[] }> = {
  food: { headlines: (f) => [`Drop by ${f.area}, or call ahead to order`, `Something good is waiting in ${f.area}`], labels: ["Call to order", "Call ahead"] },
  heritage: { headlines: (f) => [`Visit ${f.name} in ${f.area}`, `Talk to ${f.name} about what you need`], labels: ["Call us", "Call to ask"] },
  cafe: { headlines: (f) => [`See you in ${f.area}`, `Your table in ${f.area} is waiting`], labels: ["Call the café", "Call us"] },
  trade: { headlines: (f) => [`Need ${article(f.label)} ${f.label} in ${f.city}?`, `Tell ${f.name} what needs fixing`], labels: ["Call now", "Call for a visit"] },
  health: { headlines: (f) => [`Book a visit to ${f.name}`, `Talk to ${f.name} about your next visit`], labels: ["Call to book", "Book a visit"] },
  beauty: { headlines: () => ["Book your next appointment", "Ready for a fresh look?"], labels: ["Call to book", "Book by phone"] },
  retail: { headlines: (f) => [`Come and have a look in ${f.area}`, `Visit ${f.name} in ${f.area}`], labels: ["Call the shop", "Call us"] },
  fitness: { headlines: (f) => [`Start training in ${f.area}`, "Your first session starts with a call"], labels: ["Call to join", "Call us"] },
  studio: { headlines: (f) => ["Tell us what you have in mind", `Start a project with ${f.name}`], labels: ["Call the studio", "Call us"] },
  general: { headlines: (f) => [`Visit ${f.name} in ${f.area}`, `Get in touch with ${f.name}`], labels: ["Call now", "Call us"] },
};

function ctaFor(f: Facts, rng: Rng): SectionPatch["cta"] {
  const cta = CTA_BY_GROUP[f.group];
  return {
    ctaHeadline: fitLength(rng.shuffle(cta.headlines(f)), 80),
    ctaLabel: rng.pick(cta.labels),
  };
}

function seoFor(f: Facts): SiteContent["seo"] {
  const label = sentenceCase(f.label);
  const rated = ratingLine(f);
  return {
    title: fitLength([`${f.name} – ${label} in ${f.area}`, `${f.name} – ${label} in ${f.city}`, `${f.name}, ${f.city}`, f.name], 60),
    description: fitLength(
      [
        `${f.name} is ${article(f.label)} ${f.label} in ${f.place}${rated ? `, ${rated}` : ""}. Hours, directions and phone number.`,
        `${f.name}, ${f.label} in ${f.place}. Hours, directions and phone number.`,
        `${f.name} in ${f.city}. Hours, directions and phone number.`,
      ],
      155,
    ),
  };
}

function seededRng(input: SiteCopyInput, salt: string): Rng {
  return createRng(`${input.business.id}|${input.template}|${input.tone}|${salt}`);
}

export function mockSiteContent(input: SiteCopyInput, salt = ""): SiteContent {
  const f = factsFor(input.business);
  const rng = seededRng(input, salt);
  const content: SiteContent = {
    ...heroFor(f, input.template, input.tone, rng),
    ...aboutFor(f, input.tone, rng),
    ...signatureFor(f, input.business, rng),
    ...servicesSection(f, input.business, rng),
    reviewHighlights: pickReviewHighlights(input.business.reviews),
    ...ctaFor(f, rng),
    seo: seoFor(f),
  };
  return siteContentSchema.parse(content);
}

function sectionFor<S extends SectionId>(section: S, input: SiteCopyInput, rng: Rng): SectionPatch[S] {
  const f = factsFor(input.business);
  const builders: { [K in SectionId]: () => SectionPatch[K] } = {
    hero: () => heroFor(f, input.template, input.tone, rng),
    about: () => aboutFor(f, input.tone, rng),
    signature: () => signatureFor(f, input.business, rng),
    services: () => servicesSection(f, input.business, rng),
    cta: () => ctaFor(f, rng),
  };
  return builders[section]();
}

export function mockSection<S extends SectionId>(input: SectionCopyInput<S>): SectionPatch[S] {
  const current = JSON.stringify(input.current);
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const rng = seededRng(input, `${input.section}|${current.length}|${attempt}`);
    const patch = sectionFor(input.section, input, rng);
    const changed = Object.entries(patch).some(
      ([key, value]) => JSON.stringify(value) !== JSON.stringify(input.current[key as keyof SiteContent]),
    );
    if (changed || attempt === 7) return sectionSchema(input.section).parse(patch);
  }
  throw new Error("unreachable");
}

export function mockOutreach(input: OutreachInput): OutreachDraft {
  const { business, liveUrl, operatorName, channel } = input;
  const f = factsFor(business);
  const firstName = operatorName.trim().split(/\s+/)[0] || operatorName;
  const greeting = f.isIndia ? `Hello ${business.name} team,` : `Hi ${business.name} team,`;
  const rated = f.rating && f.reviewCount
    ? `${business.name} has a ${f.rating.toFixed(1)} rating from ${f.reviewCount} reviews`
    : `${business.name} has happy customers in ${f.area}`;
  const missing =
    business.websiteStatus === "social_only"
      ? "but people searching online only find a social media page, not a website"
      : "but people searching online can't find a website for you";

  if (channel === "whatsapp") {
    const body = [
      greeting,
      `I'm ${firstName}, a web designer. I noticed ${rated}, ${missing}.`,
      `I built a website for you, here it is: ${liveUrl}`,
      `It has your hours, a call button and directions. Would you like to keep it?`,
      `Thanks, ${firstName}`,
    ].join("\n\n");
    return { subject: null, body: whatsappDraftSchema.parse({ body }).body };
  }

  const subject = fitLength([`A website for ${business.name}`, "A website for your business"], 50);
  const body = [
    greeting,
    `My name is ${firstName} and I design websites for local businesses in ${f.city}. I was looking at ${plural(f.label)} in ${f.area} and noticed ${rated}, ${missing}.`,
    `I built a website for you, here it is: ${liveUrl}`,
    `It works well on phones and includes your opening hours, a tap-to-call button, directions and a few of your reviews. There is no obligation.`,
    `Would you like to keep it?`,
    `Best regards,\n${operatorName}`,
  ].join("\n\n");
  return emailDraftSchema.parse({ subject, body });
}

export class MockCopyProvider implements CopyProvider {
  readonly kind = "mock" as const;

  async generateSiteContent(input: SiteCopyInput): Promise<SiteContent> {
    return mockSiteContent(input);
  }

  async regenerateSection<S extends SectionId>(input: SectionCopyInput<S>): Promise<SectionPatch[S]> {
    return mockSection(input);
  }

  async draftOutreach(input: OutreachInput): Promise<OutreachDraft> {
    return mockOutreach(input);
  }
}
