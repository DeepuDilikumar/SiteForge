import { actionBar, baseCss, context, esc, head, hoursTable, ICONS, pageScript, paragraphs, safeUrl, stars, type Ctx } from "./shared";
import type { TemplateDefinition, TemplateRender } from "./types";

const GREEN = "#1E3A2F";
const GREEN_DEEP = "#16302A";
const BRASS = "#B08D57";
const INK = "#1B1B1B";

const FONTS =
  "https://fonts.googleapis.com/css2?family=Libre+Caslon+Display&family=Libre+Franklin:wght@400;500;600&display=swap";

function css(accent: string): string {
  return `${baseCss(accent)}
:root{--green:${GREEN};--green-deep:${GREEN_DEEP};--brass:${BRASS};--ink:${INK};--muted:#5b5f5a;--line:#e7e2d8}
body{font-family:"Libre Franklin",system-ui,sans-serif;color:var(--ink);background:#fff;font-size:17px;line-height:1.7}
.display{font-family:"Libre Caslon Display",Georgia,serif;font-weight:400;letter-spacing:-.005em}
.topbar{background:var(--green);color:#f4efe4}
.topbar .wrap{display:flex;align-items:center;justify-content:space-between;min-height:64px;gap:16px}
.brand{display:flex;align-items:center;gap:12px;text-decoration:none;font-family:"Libre Caslon Display",Georgia,serif;font-size:21px;line-height:1.2}
.brand svg{width:34px;height:34px;flex:none}
.topbar .call{display:none;align-items:center;gap:8px;color:#f4efe4;text-decoration:none;font-size:15px;font-weight:500;border:1px solid rgba(244,239,228,.35);padding:8px 16px;border-radius:999px}
.topbar .call svg{width:18px;height:18px}
@media (min-width:900px){.topbar .call{display:inline-flex}}
.hero{background:var(--green);color:#f4efe4;text-align:center;padding:40px 0 64px;position:relative;overflow:hidden}
.hero .seal{width:96px;height:96px;margin:0 auto 24px;color:var(--brass)}
.hero .kicker{font-size:13px;letter-spacing:.16em;text-transform:uppercase;color:var(--brass);font-weight:600}
.hero h1{font-size:clamp(40px,10.5vw,76px);line-height:1.04;margin:16px auto 0;max-width:15ch}
.hero .sub{margin:20px auto 0;max-width:34ch;font-size:18px;line-height:1.6;color:rgba(244,239,228,.86)}
.hero .meta{display:inline-flex;align-items:center;gap:8px;margin-top:20px;font-size:15px;color:rgba(244,239,228,.86)}
.hero .meta .stars{display:inline-flex;gap:2px;color:var(--brass)}
.hero .meta .stars svg{width:16px;height:16px}.hero .meta .stars .off{opacity:.35}
.btns{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;margin-top:32px}
.btn{display:inline-flex;align-items:center;gap:10px;min-height:52px;padding:0 28px;border-radius:999px;font-size:16px;font-weight:600;text-decoration:none;transition:transform .2s var(--ease),background-color .2s var(--ease)}
.btn svg{width:20px;height:20px}
.btn:active{transform:scale(.98)}
.btn-brass{background:var(--brass);color:var(--green-deep)}
.btn-brass:hover{background:#c29f69}
.btn-line{border:1px solid rgba(244,239,228,.45);color:#f4efe4}
.btn-line:hover{background:rgba(244,239,228,.08)}
.btn-ink{background:var(--green);color:#f4efe4}
.btn-ink:hover{background:var(--green-deep)}
.rule{display:flex;align-items:center;gap:16px;justify-content:center;color:var(--brass);margin:48px auto 0;max-width:360px}
.rule::before,.rule::after{content:"";flex:1;height:5px;border-top:1px solid currentColor;border-bottom:1px solid currentColor}
.rule svg{width:14px;height:14px}
section{padding:72px 0}
@media (min-width:900px){section{padding:104px 0}}
.label{display:block;font-size:13px;letter-spacing:.16em;text-transform:uppercase;font-weight:600;color:var(--brass);margin-bottom:16px}
.signature .grid{display:grid;gap:40px;align-items:center}
@media (min-width:900px){.signature .grid{grid-template-columns:1.1fr .9fr;gap:72px}}
.signature h2{font-size:clamp(34px,7vw,54px);line-height:1.08;color:var(--green)}
.signature p{margin-top:20px;font-size:18px;color:#3a3d39;max-width:44ch}
.plate{aspect-ratio:1;max-width:420px;width:100%;margin:0 auto;border-radius:50%;background:#f6f2ea;display:grid;place-items:center;color:var(--brass);position:relative}
.plate svg{width:78%;height:78%}
.plate .mono{position:absolute;font-family:"Libre Caslon Display",Georgia,serif;font-size:clamp(56px,14vw,96px);color:var(--green)}
.story{background:#fbf9f5;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.story .inner{max-width:680px;margin:0 auto;text-align:left}
.story h2{font-size:clamp(32px,6vw,46px);line-height:1.1;color:var(--green);text-align:center}
.story .rule{margin:24px auto 32px;max-width:200px}
.story p{font-size:19px;line-height:1.7;color:#2c2f2b}
.story p+p{margin-top:16px}
.story p:first-of-type::first-letter{font-family:"Libre Caslon Display",Georgia,serif;float:left;font-size:76px;line-height:.82;padding:8px 12px 0 0;color:var(--accent)}
.reviews+.offering{padding-top:0}
.offering .rule{margin:0 auto 56px}
.reviews h2,.offering h2{font-size:clamp(32px,6vw,46px);line-height:1.1;color:var(--green);text-align:center}
.quotes{display:grid;gap:24px;margin-top:48px}
@media (min-width:900px){.quotes{grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:32px}}
.quote{padding:32px 28px;border:1px solid var(--line);border-radius:4px;background:#fff;position:relative}
.quote::before{content:"\\201C";position:absolute;top:-6px;left:22px;font-family:"Libre Caslon Display",Georgia,serif;font-size:72px;line-height:1;color:var(--brass)}
.quote blockquote{font-family:"Libre Caslon Display",Georgia,serif;font-size:22px;line-height:1.5;margin-top:16px}
.quote figcaption{margin-top:20px;font-size:14px;color:var(--muted);font-weight:500}
.menu{margin:48px auto 0;max-width:820px;display:grid;gap:0}
@media (min-width:900px){.menu{grid-template-columns:1fr 1fr;column-gap:56px}}
.menu li{padding:24px 0;border-top:1px solid var(--line)}
.menu h3{font-family:"Libre Caslon Display",Georgia,serif;font-weight:400;font-size:24px;line-height:1.25;color:var(--green);display:flex;align-items:baseline;gap:12px}
.menu h3::before{content:"";flex:none;width:7px;height:7px;transform:rotate(45deg) translateY(-3px);background:var(--accent)}
.menu p{margin-top:8px;color:#4a4d49;font-size:16px;line-height:1.65}
.visit{background:var(--green);color:#f4efe4}
.visit .head{text-align:center}
.visit h2{font-size:clamp(34px,7vw,56px);line-height:1.06;max-width:18ch;margin:0 auto}
.visit .grid{display:grid;gap:32px;margin-top:56px}
@media (min-width:900px){.visit .grid{grid-template-columns:1fr 1fr;gap:56px}}
.card{border:1px solid rgba(244,239,228,.22);border-radius:4px;padding:28px}
.card h3{font-family:"Libre Caslon Display",Georgia,serif;font-weight:400;font-size:26px;color:var(--brass)}
.visit .hours{margin-top:12px;font-size:16px}
.visit .hours tr{border-bottom:1px solid rgba(244,239,228,.12)}
.visit .hours tr:last-child{border-bottom:0}
.visit .hours tr.is-today{color:var(--brass);font-weight:600}
.addr{margin-top:12px;font-size:17px;line-height:1.6;color:rgba(244,239,228,.9)}
.card .btns{justify-content:flex-start;margin-top:24px}
.phone-line{margin-top:12px;font-size:17px}
.phone-line a{color:#f4efe4;text-decoration-color:rgba(176,141,87,.6);text-underline-offset:4px}
footer{background:var(--green-deep);color:rgba(244,239,228,.72);padding:40px 0;font-size:14px}
footer .wrap{display:flex;flex-direction:column;gap:12px;align-items:center;text-align:center}
footer .brand{color:#f4efe4;font-size:19px}
.actionbar{background:rgba(22,48,42,.96);backdrop-filter:blur(8px);border-top:1px solid rgba(176,141,87,.35)}
.actionbar a{color:#f4efe4;border:1px solid rgba(244,239,228,.25)}
.actionbar .ab-call{background:var(--brass);color:var(--green-deep);border-color:var(--brass)}
`;
}

function seal(monogram: string): string {
  const ticks = Array.from({ length: 24 }, (_, index) => {
    const angle = (index * 15 * Math.PI) / 180;
    const x1 = 50 + Math.cos(angle) * 41;
    const y1 = 50 + Math.sin(angle) * 41;
    const x2 = 50 + Math.cos(angle) * 44;
    const y2 = 50 + Math.sin(angle) * 44;
    return `<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}"/>`;
  }).join("");
  return `<svg class="seal" viewBox="0 0 100 100" fill="none" stroke="currentColor" aria-hidden="true"><circle cx="50" cy="50" r="48" stroke-width="1"/><circle cx="50" cy="50" r="45.5" stroke-width=".6"/><g stroke-width=".8">${ticks}</g><circle cx="50" cy="50" r="38" stroke-width="1"/><text x="50" y="${monogram.length > 1 ? 60 : 62}" text-anchor="middle" fill="currentColor" stroke="none" font-family="'Libre Caslon Display',Georgia,serif" font-size="${monogram.length > 1 ? 30 : 36}">${esc(monogram)}</text></svg>`;
}

function brandMark(monogram: string): string {
  return `<svg viewBox="0 0 40 40" fill="none" stroke="${BRASS}" aria-hidden="true"><circle cx="20" cy="20" r="19" stroke-width="1"/><circle cx="20" cy="20" r="16" stroke-width=".6"/><text x="20" y="${monogram.length > 1 ? 24.5 : 26}" text-anchor="middle" fill="${BRASS}" stroke="none" font-family="'Libre Caslon Display',Georgia,serif" font-size="${monogram.length > 1 ? 13 : 16}">${esc(monogram)}</text></svg>`;
}

const DIAMOND = `<svg viewBox="0 0 14 14" fill="currentColor" aria-hidden="true"><path d="M7 0l7 7-7 7-7-7z"/></svg>`;

function plateArt(): string {
  const petals = Array.from({ length: 12 }, (_, index) => {
    const rotate = index * 30;
    return `<ellipse cx="100" cy="38" rx="6" ry="18" transform="rotate(${rotate} 100 100)"/>`;
  }).join("");
  return `<svg viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true"><circle cx="100" cy="100" r="96"/><circle cx="100" cy="100" r="90" stroke-width=".6"/><circle cx="100" cy="100" r="58"/>${petals}</svg>`;
}

function hero(ctx: Ctx): string {
  const { business, content } = ctx;
  const rating = business.rating && business.reviewCount
    ? `<p class="meta hero-in d2"><span class="stars" aria-hidden="true">${stars(business.rating)}</span><span>${esc(business.rating.toFixed(1))} from ${esc(business.reviewCount)} reviews</span></p>`
    : "";
  return `<header class="topbar"><div class="wrap"><a class="brand" href="#top">${brandMark(ctx.monogram)}<span>${esc(business.name)}</span></a>${
    ctx.tel ? `<a class="call" href="${safeUrl(ctx.tel)}">${ICONS.phone}<span>${esc(ctx.phone)}</span></a>` : ""
  }</div></header>
<section class="hero" id="top" aria-labelledby="hero-title">
  <div class="wrap">
    <div class="hero-in" data-slot="hero-photo">${seal(ctx.monogram)}</div>
    <p class="kicker hero-in">${esc(business.category)} · ${esc(business.city)}</p>
    <h1 id="hero-title" class="display hero-in d1">${esc(content.headline)}</h1>
    <p class="sub hero-in d2">${esc(content.subheadline)}</p>
    ${rating}
    <div class="btns hero-in d3">
      ${ctx.tel ? `<a class="btn btn-brass" href="${safeUrl(ctx.tel)}">${ICONS.phone}${esc(content.ctaLabel)}</a>` : ""}
      <a class="btn btn-line" href="${safeUrl(ctx.maps)}" target="_blank" rel="noopener">${ICONS.directions}Visit us</a>
    </div>
    <div class="rule hero-in d3">${DIAMOND}</div>
  </div>
</section>`;
}

function signature(ctx: Ctx): string {
  const { content } = ctx;
  const item = content.signature ?? { title: content.services[0].name, body: content.services[0].description };
  return `<section class="signature" aria-labelledby="sig-title"><div class="wrap grid">
  <div><span class="label">The one to try</span><h2 id="sig-title" class="display">${esc(item.title)}</h2>${paragraphs(item.body)}</div>
  <div class="plate" data-slot="signature-photo">${plateArt()}<span class="mono" aria-hidden="true">${esc(ctx.monogram)}</span></div>
</div></section>`;
}

function story(ctx: Ctx): string {
  const { about } = ctx.content;
  return `<section class="story" aria-labelledby="story-title"><div class="wrap"><div class="inner">
  <h2 id="story-title" class="display">${esc(about.title)}</h2>
  <div class="rule">${DIAMOND}</div>
  ${paragraphs(about.body)}
</div></div></section>`;
}

function reviews(ctx: Ctx): string {
  const items = ctx.content.reviewHighlights;
  if (items.length === 0) return "";
  return `<section class="reviews" aria-labelledby="rev-title"><div class="wrap">
  <h2 id="rev-title" class="display">In their words</h2>
  <div class="quotes reveal">${items
    .map((item) => `<figure class="quote"><blockquote>${esc(item.quote)}</blockquote><figcaption>${esc(item.author)}</figcaption></figure>`)
    .join("")}</div>
</div></section>`;
}

function offering(ctx: Ctx): string {
  return `<section class="offering" aria-labelledby="off-title"><div class="wrap">
  <div class="rule">${DIAMOND}</div>
  <h2 id="off-title" class="display">What we offer</h2>
  <ul class="menu">${ctx.content.services
    .map((service) => `<li><h3>${esc(service.name)}</h3><p>${esc(service.description)}</p></li>`)
    .join("")}</ul>
</div></section>`;
}

function visit(ctx: Ctx): string {
  const { business, content } = ctx;
  const hours = hoursTable(ctx);
  return `<section class="visit" id="visit" aria-labelledby="visit-title"><div class="wrap">
  <div class="head"><span class="label">Visit us</span><h2 id="visit-title" class="display">${esc(content.ctaHeadline)}</h2>
  <div class="btns">${ctx.tel ? `<a class="btn btn-brass" href="${safeUrl(ctx.tel)}">${ICONS.phone}${esc(content.ctaLabel)}</a>` : ""}<a class="btn btn-line" href="${safeUrl(ctx.maps)}" target="_blank" rel="noopener">${ICONS.directions}Get directions</a></div></div>
  <div class="grid">
    ${hours ? `<div class="card"><h3>Opening hours</h3>${hours}</div>` : ""}
    <div class="card"><h3>Find us</h3><p class="addr">${esc(business.address)}</p>${
      ctx.tel ? `<p class="phone-line"><a href="${safeUrl(ctx.tel)}">${esc(ctx.phone)}</a></p>` : ""
    }<div class="btns"><a class="btn btn-line" href="${safeUrl(ctx.maps)}" target="_blank" rel="noopener">${ICONS.pin}Open in Maps</a></div></div>
  </div>
</div></section>`;
}

function footer(ctx: Ctx): string {
  return `<footer><div class="wrap"><span class="brand">${brandMark(ctx.monogram)}<span>${esc(ctx.business.name)}</span></span><p>${esc(ctx.business.address)}</p><p>© ${ctx.year} ${esc(ctx.business.name)}</p></div></footer>`;
}

export const renderLegacy: TemplateRender = (content, business, opts) => {
  const ctx = context(content, business, opts);
  return `${head(ctx, { fontsHref: FONTS, css: css(ctx.accent), themeColor: GREEN, faviconBg: GREEN, faviconFg: BRASS })}
<body>
${hero(ctx)}
<main>
${signature(ctx)}
${story(ctx)}
${reviews(ctx)}
${offering(ctx)}
${visit(ctx)}
</main>
${footer(ctx)}
${actionBar(ctx)}
${pageScript(business.hours)}
</body>
</html>`;
};

export const legacyTemplate: TemplateDefinition = {
  id: "legacy",
  name: "Legacy",
  description: "Heritage and story-led, for established family businesses.",
  render: renderLegacy,
};
