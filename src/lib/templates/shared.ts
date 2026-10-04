import type { SiteContent } from "@/lib/ai/schemas";
import { isMobileCapable, telHref, waDigits } from "@/lib/phone";
import type { Business } from "@/lib/places/types";
import { initials } from "@/lib/util/text";
import type { TemplateOptions } from "./types";

const ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/** Escape text for HTML element content and attribute values. Every dynamic value goes through this. */
export function esc(value: string | number | null | undefined): string {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ESCAPES[char]);
}

/** Only allow http(s), tel and mailto URLs into href attributes. */
export function safeUrl(url: string): string {
  return /^(https?:|tel:|mailto:)/i.test(url.trim()) ? esc(url.trim()) : "#";
}

/** Accent colours are validated upstream; this is a last line of defence before CSS. */
export function safeColor(color: string): string {
  return /^#[0-9a-f]{6}$/i.test(color) ? color : "#1A73E8";
}

export const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export type Ctx = {
  content: SiteContent;
  business: Business;
  accent: string;
  canonicalUrl?: string;
  lang: string;
  monogram: string;
  phone: string | null;
  tel: string | null;
  whatsapp: string | null;
  maps: string;
  year: number;
};

export function context(content: SiteContent, business: Business, opts: TemplateOptions): Ctx {
  const phone = business.phone?.trim() || null;
  const wa = phone && isMobileCapable(phone, business.countryCode) ? waDigits(phone, business.countryCode) : null;
  const langs: Record<Business["countryCode"], string> = { IN: "en-IN", US: "en-US", GB: "en-GB", AU: "en-AU" };
  return {
    content,
    business,
    accent: safeColor(opts.accent),
    canonicalUrl: opts.canonicalUrl,
    lang: langs[business.countryCode],
    monogram: initials(business.name),
    phone,
    tel: phone ? telHref(phone, business.countryCode) : null,
    whatsapp: wa ? `https://wa.me/${wa}` : null,
    maps: business.mapsUrl,
    year: new Date().getFullYear(),
  };
}

export function faviconDataUri(monogram: string, background: string, foreground: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${background}"/><text x="32" y="41" text-anchor="middle" font-family="Georgia, serif" font-size="${monogram.length > 1 ? 26 : 32}" font-weight="600" fill="${foreground}">${esc(monogram)}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function head(
  ctx: Ctx,
  options: { fontsHref: string; css: string; themeColor: string; faviconBg: string; faviconFg: string },
): string {
  const { content, business } = ctx;
  const title = esc(content.seo.title);
  const description = esc(content.seo.description);
  const ogTitle = esc(`${business.name}: ${content.headline}`);
  return `<!doctype html>
<html lang="${ctx.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${title}</title>
<meta name="description" content="${description}">
<meta name="theme-color" content="${options.themeColor}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(business.name)}">
<meta property="og:title" content="${ogTitle}">
<meta property="og:description" content="${esc(content.subheadline)}">
${ctx.canonicalUrl ? `<meta property="og:url" content="${safeUrl(ctx.canonicalUrl)}">\n<link rel="canonical" href="${safeUrl(ctx.canonicalUrl)}">` : ""}
<meta name="twitter:card" content="summary">
<link rel="icon" href="${faviconDataUri(ctx.monogram, options.faviconBg, options.faviconFg)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${options.fontsHref}">
<script>document.documentElement.classList.add('js')</script>
<style>${options.css}</style>
</head>`;
}

/** Shared base rules every template includes: reset, hero motion, review reveal, action bar. */
export function baseCss(accent: string): string {
  return `
:root{--accent:${accent};--on-accent:${onAccent(accent)};--ease:cubic-bezier(.2,0,0,1)}
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;text-size-adjust:100%;scroll-behavior:smooth}
body{margin:0;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
img,svg{display:block;max-width:100%}
a{color:inherit}
h1,h2,h3,p,ul,ol,dl,figure,blockquote{margin:0}
ul,ol{padding:0;list-style:none}
:focus-visible{outline:2px solid var(--accent);outline-offset:3px}
.wrap{width:100%;max-width:1120px;margin:0 auto;padding:0 20px}
@media (min-width:720px){.wrap{padding:0 40px}}
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);border:0}
@keyframes rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
.hero-in{animation:rise .48s var(--ease) both}
.hero-in.d1{animation-delay:.06s}.hero-in.d2{animation-delay:.12s}.hero-in.d3{animation-delay:.18s}
.js .reveal{opacity:0;transform:translateY(18px);transition:opacity .6s var(--ease),transform .6s var(--ease)}
.js .reveal.is-in{opacity:1;transform:none}
.hours{width:100%;border-collapse:collapse}
.hours th,.hours td{padding:10px 0;text-align:left;font-weight:inherit;vertical-align:top}
.hours td{text-align:right}
.hours .today-tag{display:none}
.hours tr.is-today .today-tag{display:inline}
.actionbar{position:fixed;left:0;right:0;bottom:0;z-index:20;display:flex;gap:8px;padding:10px 12px calc(10px + env(safe-area-inset-bottom));}
.actionbar a{flex:1;display:flex;align-items:center;justify-content:center;gap:8px;min-height:48px;border-radius:999px;font-weight:600;font-size:15px;text-decoration:none}
.actionbar svg{width:20px;height:20px}
body{padding-bottom:calc(76px + env(safe-area-inset-bottom))}
@media (min-width:900px){.actionbar{display:none}body{padding-bottom:0}}
@media (prefers-reduced-motion:reduce){.hero-in{animation:none}.js .reveal{opacity:1;transform:none;transition:none}html{scroll-behavior:auto}}
`;
}

export const ICONS = {
  phone: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>`,
  directions: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>`,
  whatsapp: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 20.5l1.3-4.2A8.5 8.5 0 1 1 8 19.4z"/><path d="M9 8.8c.2 2.6 3.4 5.8 6 6l1-1.4-2-1-1 .8a5 5 0 0 1-2.4-2.4l.8-1-1-2z"/></svg>`,
  star: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8L3.5 9.7l5.9-.8z"/></svg>`,
  clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>`,
  pin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>`,
  chat: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z"/><path d="M8 9.5h8M8 12.5h5"/></svg>`,
  arrow: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`,
};

const SERVICE_ICONS: Array<[RegExp, string]> = [
  [/leak|pipe|drain|water|tank|plumb|heater|tap/i, `<path d="M12 3s6 6.4 6 11a6 6 0 0 1-12 0c0-4.6 6-11 6-11z"/>`],
  [/wir|electric|fault|light|fan|panel|inverter|battery/i, `<path d="M13 3L5 13h6l-1 8 8-10h-6z"/>`],
  [/car|engine|brake|tyre|auto|ac repair|trip|service$/i, `<path d="M4 15l1.5-5A2 2 0 0 1 7.4 8.5h9.2a2 2 0 0 1 1.9 1.5L20 15"/><rect x="3" y="15" width="18" height="4" rx="1.5"/><circle cx="7.5" cy="19" r="1.5"/><circle cx="16.5" cy="19" r="1.5"/>`],
  [/tooth|teeth|dent|root|crown|filling|clean/i, `<path d="M8 3.5c-2.5 0-4 2-4 4.5 0 3 1.5 4.5 2 7 .4 2 .8 5.5 2.3 5.5s1.5-4 3.7-4 2.2 4 3.7 4 1.9-3.5 2.3-5.5c.5-2.5 2-4 2-7 0-2.5-1.5-4.5-4-4.5-1.6 0-2.6 1-4 1s-2.4-1-4-1z"/>`],
  [/hair|cut|styl|colou?r|barber|spa|makeup|bridal|threading|wax|skin|facial/i, `<circle cx="6.5" cy="7" r="2.5"/><circle cx="6.5" cy="17" r="2.5"/><path d="M8.6 8.4L20 17M8.6 15.6L20 7"/>`],
  [/coffee|tea|brew|espresso|cup/i, `<path d="M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M16 10.5h1.5a2.5 2.5 0 0 1 0 5H16M8 3.5c0 1.5 1 1.5 1 3M12 3.5c0 1.5 1 1.5 1 3"/>`],
  [/bread|bun|bake|cake|biscuit|cookie|pastr|snack|loaf/i, `<path d="M5 11a4 4 0 0 1 2-7.5c1.5 0 2.5.7 3 1.2.5-.5 1.5-1.2 3-1.2s2.5.7 3 1.2c.5-.5 1.5-1.2 3-1.2a4 4 0 0 1 0 7.5V19a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19z"/>`],
  [/meal|lunch|biryani|breakfast|dining|special|plate|menu|food|takeaway|order/i, `<circle cx="12" cy="13" r="6.5"/><circle cx="12" cy="13" r="3"/><path d="M3 4v5M5 4v5M3 7h2M21 4c-1.5 1-2 3-2 5h2z"/>`],
  [/train|gym|class|fitness|session/i, `<path d="M3 9v6M6 7v10M18 7v10M21 9v6M6 12h12"/>`],
  [/flower|bouquet|garland|plant/i, `<circle cx="12" cy="9" r="2.5"/><path d="M12 6.5c0-2 1-3.5 2.5-3.5S17 4.5 17 6s-1.5 2.5-2.5 3M9.5 9C7.5 9 6 8 6 6.5S7.5 4 9 4s2.5 1 3 2.5M12 11.5V21M12 16c-2 0-4-1-4.5-3M12 18c2 0 4-1 4.5-3"/>`],
];

const DEFAULT_SERVICE_ICON = `<path d="M5 12.5l4.5 4.5L19 7.5"/>`;

export function serviceIcon(name: string): string {
  const path = SERVICE_ICONS.find(([pattern]) => pattern.test(name))?.[1] ?? DEFAULT_SERVICE_ICON;
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
}

export function hoursTable(ctx: Ctx, todayLabel = "Today"): string {
  const hours = ctx.business.hours;
  if (!hours) return "";
  const rows = DAY_NAMES.map(
    (day, index) =>
      `<tr data-day="${index}"><th scope="row">${day} <span class="today-tag">· ${esc(todayLabel)}</span></th><td>${esc(hours[index] ?? "")}</td></tr>`,
  ).join("");
  return `<table class="hours"><caption class="sr-only">Opening hours</caption><tbody>${rows}</tbody></table>`;
}

/** Highlights today's row in every hours table, fills [data-today-hours], and runs the review reveal. */
export function pageScript(hours: string[] | null): string {
  return `<script>
(function(){
  var i=(new Date().getDay()+6)%7;
  document.querySelectorAll('tr[data-day="'+i+'"]').forEach(function(r){r.classList.add('is-today')});
  var h=${JSON.stringify(hours ?? null).replace(/</g, "\\u003c")};
  document.querySelectorAll('[data-today-hours]').forEach(function(el){
    if(!h){return}
    var t=h[i];el.textContent=/closed/i.test(t)?'Closed today':'Open today · '+t;el.style.visibility='visible';
  });
  var items=document.querySelectorAll('.reveal');
  if(!('IntersectionObserver' in window)){items.forEach(function(e){e.classList.add('is-in')});return}
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('is-in');io.unobserve(e.target)}})},{threshold:.15});
  items.forEach(function(e){io.observe(e)});
})();
</script>`;
}

export function actionBar(ctx: Ctx): string {
  const links = [
    ctx.tel ? `<a class="ab-call" href="${safeUrl(ctx.tel)}">${ICONS.phone}<span>Call</span></a>` : "",
    `<a class="ab-dir" href="${safeUrl(ctx.maps)}" target="_blank" rel="noopener">${ICONS.directions}<span>Directions</span></a>`,
    ctx.whatsapp ? `<a class="ab-wa" href="${safeUrl(ctx.whatsapp)}" target="_blank" rel="noopener">${ICONS.whatsapp}<span>WhatsApp</span></a>` : "",
  ].join("");
  return `<nav class="actionbar" aria-label="Quick actions">${links}</nav>`;
}

export function stars(rating: number): string {
  const full = Math.round(rating);
  return Array.from({ length: 5 }, (_, index) =>
    `<span class="${index < full ? "on" : "off"}">${ICONS.star}</span>`,
  ).join("");
}

export function ratingText(business: Business): string | null {
  if (!business.rating || !business.reviewCount) return null;
  return `${business.rating.toFixed(1)} · ${business.reviewCount} review${business.reviewCount === 1 ? "" : "s"}`;
}

/** Paragraph breaks in user-edited copy become separate paragraphs. */
export function paragraphs(text: string, className = ""): string {
  return text
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => `<p${className ? ` class="${className}"` : ""}>${esc(part)}</p>`)
    .join("");
}

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16) / 255);
  const [r, g, b] = channels.map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Black or white, whichever reads better on the accent colour. */
export function onAccent(accent: string): string {
  const lum = luminance(safeColor(accent));
  const whiteContrast = 1.05 / (lum + 0.05);
  const blackContrast = (lum + 0.05) / 0.05;
  return whiteContrast >= 4 || whiteContrast >= blackContrast ? "#ffffff" : "#000000";
}
