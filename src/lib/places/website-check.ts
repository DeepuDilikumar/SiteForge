import type { WebsiteStatus } from "@/lib/db/schema";

const SOCIAL_HOSTS = [
  "facebook.com",
  "fb.com",
  "fb.me",
  "instagram.com",
  "linktr.ee",
  "wa.me",
  "whatsapp.com",
  "sites.google.com",
  "business.site",
  "g.page",
];

function hostOf(uri: string): string | null {
  try {
    const withScheme = /^[a-z]+:\/\//i.test(uri) ? uri : `https://${uri}`;
    return new URL(withScheme).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
}

export function classifyWebsite(uri: string | null | undefined): WebsiteStatus {
  if (!uri || !uri.trim()) return "none";
  const host = hostOf(uri.trim());
  if (!host) return "none";
  const isSocial = SOCIAL_HOSTS.some((social) => host === social || host.endsWith(`.${social}`));
  return isSocial ? "social_only" : "has_site";
}
