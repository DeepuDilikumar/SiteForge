import type { Business, Review } from "@/lib/places/types";
import { shortAuthor, truncateWords } from "@/lib/util/text";

const COUNTRY_WORDS = /^(india|usa|united states|uk|united kingdom|australia)$/i;

/** The neighbourhood or street a business sits on, taken from its address. */
export function areaName(business: Business): string {
  const parts = business.address.split(",").map((part) => part.trim()).filter(Boolean);
  const city = business.city.toLowerCase();
  const candidate = parts.find(
    (part) => !/\d/.test(part) && part.toLowerCase() !== city && !COUNTRY_WORDS.test(part),
  );
  return candidate ?? business.city;
}

export function openDays(business: Business): number | null {
  if (!business.hours) return null;
  return business.hours.filter((range) => !/closed/i.test(range)).length;
}

export function openDaysPhrase(business: Business): string | null {
  const days = openDays(business);
  if (days === null || days === 0) return null;
  if (days === 7) return "open every day of the week";
  if (days === 6) return "open six days a week";
  return `open ${days} days a week`;
}

const THEMES: Array<[RegExp, string]> = [
  [/\bfresh/i, "freshness"],
  [/\bhonest/i, "honesty"],
  [/\bpatient|patience/i, "patience"],
  [/\bclean\b|sterilis|tidy|neat/i, "careful, tidy work"],
  [/\bfriendly|polite|warm/i, "friendly people"],
  [/same day|on time|quick|quickly|didn't have to wait|ready when/i, "prompt service"],
  [/\bfair|reasonable|worth/i, "fair prices"],
  [/consistent|for years|every time|regular/i, "consistency"],
  [/explain|walked us through|listened/i, "clear explanations"],
  [/generous|portions/i, "generous portions"],
];

/** Themes that reviewers actually mention, in order of how often they come up. */
export function reviewThemes(reviews: Review[]): string[] {
  const counts = new Map<string, number>();
  for (const review of reviews) {
    for (const [pattern, theme] of THEMES) {
      if (pattern.test(review.text)) counts.set(theme, (counts.get(theme) ?? 0) + 1);
    }
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([theme]) => theme);
}

const KNOWN_ITEMS = [
  "plum cake", "egg puffs", "butter biscuits", "honey cake", "sourdough", "birthday cake", "fish curry",
  "biryani", "appam and stew", "brisket", "filter coffee", "banana bread", "cold brew", "cardamom latte",
  "espresso", "breakfast tacos", "pastries",
];

/** A specific product or service that a reviewer names, if any. */
export function namedItem(reviews: Review[]): string | null {
  const sorted = [...reviews].sort((a, b) => b.rating - a.rating);
  for (const review of sorted) {
    const text = review.text.toLowerCase();
    const found = KNOWN_ITEMS.find((item) => text.includes(item));
    if (found) return found;
  }
  return null;
}

/** Trim a real review to a quotable excerpt of at most `maxWords` words. */
export function excerpt(text: string, maxWords = 30): string {
  const sentences = text.match(/[^.!?]+[.!?]+/g) ?? [text];
  let result = "";
  for (const sentence of sentences) {
    const next = `${result} ${sentence.trim()}`.trim();
    if (next.split(/\s+/).length > maxWords) break;
    result = next;
  }
  return result || truncateWords(text, maxWords);
}

export function pickReviewHighlights(reviews: Review[], max = 3) {
  return [...reviews]
    .filter((review) => review.rating >= 4 && review.text.trim().length > 0)
    .sort((a, b) => b.rating - a.rating || b.text.length - a.text.length)
    .slice(0, max)
    .map((review) => ({ quote: excerpt(review.text), author: shortAuthor(review.author) }));
}

function normaliseQuote(text: string): string {
  return text.toLowerCase().replace(/[…"“”'’.,!?;:\s]+/g, " ").trim();
}

/** Keep only highlights that really are excerpts of a provided review, with proper attribution. */
export function verifiedHighlights(
  highlights: Array<{ quote: string; author: string }>,
  reviews: Review[],
): Array<{ quote: string; author: string }> {
  const verified = highlights.flatMap((highlight) => {
    const quote = normaliseQuote(highlight.quote);
    const source = reviews.find((review) => quote.length > 0 && normaliseQuote(review.text).includes(quote));
    return source ? [{ quote: highlight.quote.trim(), author: shortAuthor(source.author) }] : [];
  });
  return verified.length > 0 ? verified.slice(0, 3) : pickReviewHighlights(reviews);
}
