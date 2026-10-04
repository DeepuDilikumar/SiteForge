import type { TemplateId } from "@/lib/db/schema";

export type CategoryGroup =
  | "food"
  | "heritage"
  | "trade"
  | "health"
  | "beauty"
  | "cafe"
  | "retail"
  | "fitness"
  | "studio"
  | "general";

export const ACCENT_SWATCHES = [
  { value: "#1A73E8", name: "Blue" },
  { value: "#0B8043", name: "Green" },
  { value: "#C5221F", name: "Red" },
  { value: "#E37400", name: "Orange" },
  { value: "#7B1FA2", name: "Purple" },
  { value: "#00796B", name: "Teal" },
] as const;

export type AccentColor = (typeof ACCENT_SWATCHES)[number]["value"];

export const ACCENT_VALUES = ACCENT_SWATCHES.map((swatch) => swatch.value) as [
  AccentColor,
  ...AccentColor[],
];

const GROUP_KEYWORDS: Array<[CategoryGroup, RegExp]> = [
  ["cafe", /\b(caf[eé]|coffee|roaster|roastery|tea room|tea shop|juice)/i],
  ["food", /\b(bakery|bakeries|baker|bakes|cake|sweet|mithai|restaurant|eatery|meals|biryani|dhaba|mess|kitchen|food|catering|caterer|pizza|thali|tiffin|bbq|barbecue|grill|diner|deli|butcher)\b/i],
  ["heritage", /\b(tailor|jewell?er|goldsmith|silversmith|handloom|weaver|potter|printing press|cobbler|watch repair|antique|bookbinder|spice)\b/i],
  ["fitness", /\b(gym|fitness|yoga|pilates|crossfit|martial|karate|boxing|dance|swim)\b/i],
  ["studio", /\b(studio|photograph|tattoo|design|gallery|music|art school|architect)\b/i],
  ["retail", /\b(florist|flowers?|boutique|clothing|fashion|apparel|store|shop|books?|gifts?|decor|furniture|plants?|nursery)\b/i],
  ["health", /\b(dent|clinic|doctor|physio|hospital|pharmacy|chemist|optic|optician|eye|vet|veterinar|ayurved|homeopath|lab|diagnostic|therap)\b/i],
  ["beauty", /\b(salon|parlou?r|beauty|barber|spa|hair|nail|makeup|bridal|grooming)\b/i],
  ["trade", /\b(plumb|electric|mechanic|garage|auto|car repair|carpent|paint|ac repair|air condition|hvac|pest|laundry|dry clean|repair|locksmith|roof|mason|welding|tyre|tire|mobile|appliance|cleaning|movers|packers|car wash|driving school)\b/i],
];

export function categoryGroup(category: string): CategoryGroup {
  const match = GROUP_KEYWORDS.find(([, pattern]) => pattern.test(category));
  return match ? match[0] : "general";
}

const GROUP_TEMPLATE: Record<CategoryGroup, TemplateId> = {
  food: "legacy",
  heritage: "legacy",
  trade: "modern",
  health: "modern",
  beauty: "modern",
  general: "modern",
  cafe: "bold",
  retail: "bold",
  fitness: "bold",
  studio: "bold",
};

const GROUP_ACCENT: Record<CategoryGroup, AccentColor> = {
  food: "#C5221F",
  heritage: "#0B8043",
  trade: "#1A73E8",
  health: "#00796B",
  beauty: "#7B1FA2",
  general: "#1A73E8",
  cafe: "#E37400",
  retail: "#7B1FA2",
  fitness: "#C5221F",
  studio: "#1A73E8",
};

export function recommendTemplate(category: string): TemplateId {
  return GROUP_TEMPLATE[categoryGroup(category)];
}

export function recommendAccent(category: string): AccentColor {
  return GROUP_ACCENT[categoryGroup(category)];
}

export function isAccentColor(value: string): value is AccentColor {
  return (ACCENT_VALUES as string[]).includes(value);
}
