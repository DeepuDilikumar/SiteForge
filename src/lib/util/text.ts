export function titleCase(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/(^|[\s(-])(\p{L})/gu, (_, lead: string, char: string) => lead + char.toUpperCase());
}

export function sentenceCase(input: string): string {
  const trimmed = input.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

export function singularize(word: string): string {
  const lower = word.toLowerCase();
  if (/(ss|us|is)$/.test(lower)) return word;
  if (/ies$/.test(lower)) return word.slice(0, -3) + "y";
  if (/(ches|shes|sses|xes|zes)$/.test(lower)) return word.slice(0, -2);
  if (/s$/.test(lower)) return word.slice(0, -1);
  return word;
}

export function singularizePhrase(phrase: string): string {
  const words = phrase.trim().split(/\s+/);
  const last = words.pop() ?? "";
  return [...words, singularize(last)].join(" ");
}

export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** First name plus last initial, e.g. "Anjali M.". */
export function shortAuthor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "A customer";
  const first = parts[0];
  const last = parts.length > 1 ? parts[parts.length - 1] : "";
  return last ? `${first} ${last.charAt(0).toUpperCase()}.` : first;
}

export function initials(name: string): string {
  const words = name
    .replace(/[^\p{L}\p{N}\s&]/gu, " ")
    .split(/\s+/)
    .filter((word) => word && !/^(the|and|&|of|dr|co)$/i.test(word));
  const letters = words.slice(0, 2).map((word) => word.charAt(0).toUpperCase());
  return letters.join("") || "S";
}

export function truncateWords(text: string, maxWords: number): string {
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text.trim();
  return `${words.slice(0, maxWords).join(" ").replace(/[,;:]$/, "")}…`;
}

export function fitLength(candidates: string[], max: number): string {
  const fit = candidates.find((candidate) => candidate.length <= max);
  if (fit) return fit;
  const first = candidates[0] ?? "";
  return first.length <= max ? first : `${first.slice(0, max - 1).trimEnd()}…`;
}

export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
}
