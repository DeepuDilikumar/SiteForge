import type { SiteContent, SiteOverrides } from "@/lib/ai/schemas";
import type { TemplateId } from "@/lib/db/schema";
import type { Business } from "@/lib/places/types";
import { TEMPLATES } from "@/lib/templates";
import { esc } from "@/lib/templates/shared";

export type RenderInput = {
  template: TemplateId;
  content: SiteContent;
  business: Business;
  overrides?: SiteOverrides;
  accent: string;
  watermark: boolean;
  canonicalUrl?: string;
  appUrl?: string;
};

/** Apply the operator's edits to business facts (phone, hours) before rendering. */
export function applyOverrides(business: Business, overrides: SiteOverrides = {}): Business {
  return {
    ...business,
    phone: overrides.phone !== undefined ? overrides.phone || null : business.phone,
    hours: overrides.hours ?? business.hours,
  };
}

const WATERMARK_CSS =
  ".sf-badge{display:flex;justify-content:center;padding:16px 16px 24px;background:#fff;border-top:1px solid #e8eaed}" +
  ".sf-badge a{display:inline-flex;align-items:center;gap:8px;padding:8px 16px;border-radius:999px;border:1px solid #dadce0;background:#fff;color:#3c4043;font:500 13px/1.2 system-ui,-apple-system,sans-serif;text-decoration:none}" +
  ".sf-badge svg{width:14px;height:14px}";

const SPARK = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#1A73E8" d="M12 2l2.2 6.6L21 11l-6.8 2.4L12 20l-2.2-6.6L3 11l6.8-2.4z"/></svg>`;

/** Server-side watermark for free plans. Inserted into the HTML, never added by client CSS. */
export function injectWatermark(html: string, appUrl?: string): string {
  const href = appUrl ? esc(appUrl) : "#";
  const badge = `<style>${WATERMARK_CSS}</style><div class="sf-badge"><a href="${href}" target="_blank" rel="noopener">${SPARK}Built with SiteForge</a></div>`;
  return html.replace(/<nav class="actionbar"/, `${badge}\n<nav class="actionbar"`);
}

export function renderSite(input: RenderInput): string {
  const business = applyOverrides(input.business, input.overrides);
  const html = TEMPLATES[input.template].render(input.content, business, {
    accent: input.accent,
    canonicalUrl: input.canonicalUrl,
  });
  return input.watermark ? injectWatermark(html, input.appUrl) : html;
}

/** Content Security Policy for rendered client sites (preview and published). */
export const SITE_CSP = [
  "default-src 'none'",
  "style-src 'unsafe-inline' https://fonts.googleapis.com",
  "font-src https://fonts.gstatic.com",
  "script-src 'unsafe-inline'",
  "img-src data: https:",
  "base-uri 'none'",
  "form-action 'none'",
].join("; ");
