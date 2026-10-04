import { areaName, openDays } from "@/lib/ai/copy-facts";
import {
  actionBar,
  baseCss,
  context,
  esc,
  head,
  hoursTable,
  ICONS,
  onAccent,
  pageScript,
  paragraphs,
  ratingText,
  safeUrl,
  serviceIcon,
  stars,
  type Ctx,
} from "./shared";
import type { TemplateDefinition, TemplateRender } from "./types";

const FONTS = "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap";

function css(accent: string): string {
  return `${baseCss(accent)}
:root{--ink:#0F172A;--muted:#475569;--surface:#F4F6F8;--line:#E2E8F0;--soft:color-mix(in srgb,var(--accent) 10%,#fff);--soft-2:color-mix(in srgb,var(--accent) 18%,#fff)}
body{font-family:Manrope,system-ui,sans-serif;color:var(--ink);background:#fff;font-size:16px;line-height:1.6}
h1,h2,h3{letter-spacing:-.025em;line-height:1.1;font-weight:800}
.top{position:sticky;top:0;z-index:15;background:rgba(255,255,255,.92);backdrop-filter:saturate(1.4) blur(10px);border-bottom:1px solid var(--line)}
.top .wrap{display:flex;align-items:center;justify-content:space-between;min-height:64px;gap:16px}
.brand{display:flex;align-items:center;gap:12px;text-decoration:none;font-weight:800;font-size:17px;letter-spacing:-.01em;min-width:0}
.brand span:last-child{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mark{flex:none;width:36px;height:36px;border-radius:10px;background:var(--accent);color:var(--on-accent);display:grid;place-items:center;font-size:14px;font-weight:800;letter-spacing:0}
.top nav{display:none;gap:28px;font-size:15px;font-weight:600;color:var(--muted)}
.top nav a{text-decoration:none}.top nav a:hover{color:var(--ink)}
.top .call{display:none}
@media (min-width:900px){.top nav{display:flex}.top .call{display:inline-flex}}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;min-height:52px;padding:0 24px;border-radius:999px;font-weight:700;font-size:16px;text-decoration:none;transition:transform .2s var(--ease),box-shadow .2s var(--ease),background-color .2s var(--ease)}
.btn svg{width:20px;height:20px}
.btn:active{transform:scale(.98)}
.btn-primary{background:var(--accent);color:var(--on-accent);box-shadow:0 1px 2px rgba(15,23,42,.12),0 6px 16px -6px color-mix(in srgb,var(--accent) 60%,transparent)}
.btn-primary:hover{box-shadow:0 2px 4px rgba(15,23,42,.14),0 10px 24px -8px color-mix(in srgb,var(--accent) 70%,transparent)}
.btn-outline{background:#fff;color:var(--ink);border:1px solid var(--line)}
.btn-outline:hover{background:var(--surface)}
.btn-sm{min-height:44px;padding:0 18px;font-size:15px}
.hero{padding:40px 0 56px;background:linear-gradient(var(--surface),#fff)}
.hero .grid{display:grid;gap:40px;align-items:center}
@media (min-width:900px){.hero{padding:80px 0 96px}.hero .grid{grid-template-columns:1.15fr .85fr;gap:64px}}
.badge{display:inline-flex;align-items:center;gap:10px;padding:8px 16px 8px 12px;border-radius:999px;background:#fff;border:1px solid var(--line);font-size:14px;font-weight:700;box-shadow:0 1px 2px rgba(15,23,42,.06)}
.badge .stars{display:flex;gap:1px;color:#F5A524}.badge .stars svg{width:16px;height:16px}.badge .stars .off{color:#CBD5E1}
.badge .count{color:var(--muted);font-weight:600}
.hero h1{font-size:clamp(38px,9vw,64px);margin-top:20px;max-width:16ch}
.hero .sub{margin-top:16px;font-size:18px;color:var(--muted);max-width:46ch}
.hero .btns{display:flex;flex-wrap:wrap;gap:12px;margin-top:28px}
.today{display:flex;align-items:center;gap:8px;margin-top:20px;font-size:14px;font-weight:600;color:var(--muted);min-height:22px;visibility:hidden}
.today svg{width:18px;height:18px;color:var(--accent)}
.panel{background:#fff;border:1px solid var(--line);border-radius:24px;padding:28px;box-shadow:0 1px 2px rgba(15,23,42,.04),0 24px 48px -24px rgba(15,23,42,.18);position:relative;overflow:hidden}
.panel::before{content:"";position:absolute;inset:0 0 auto 0;height:96px;background:var(--soft)}
.panel>*{position:relative}
.panel .mark{width:56px;height:56px;border-radius:16px;font-size:20px}
.panel h2{font-size:22px;margin-top:20px}
.panel .cat{color:var(--muted);font-weight:600;font-size:15px;margin-top:4px}
.panel dl{margin-top:20px;display:grid;gap:16px}
.panel dl div{display:flex;gap:12px;align-items:flex-start;font-size:15px}
.panel dt svg{width:20px;height:20px;color:var(--accent);margin-top:2px}
.panel dd{margin:0;color:var(--ink)}
section{padding:64px 0}
@media (min-width:900px){section{padding:96px 0}}
.eyebrow{display:block;color:var(--accent);font-weight:700;font-size:14px;margin-bottom:12px}
.sec-title{font-size:clamp(30px,6vw,44px);max-width:20ch}
.sec-lead{color:var(--muted);font-size:17px;margin-top:12px;max-width:52ch}
.services .grid{display:grid;gap:16px;margin-top:40px}
@media (min-width:640px){.services .grid{grid-template-columns:1fr 1fr}}
@media (min-width:1000px){.services .grid{grid-template-columns:repeat(3,1fr);gap:20px}}
.svc{border:1px solid var(--line);border-radius:20px;padding:24px;background:#fff;transition:border-color .2s var(--ease),box-shadow .2s var(--ease)}
.svc:hover{border-color:color-mix(in srgb,var(--accent) 40%,var(--line));box-shadow:0 12px 32px -20px rgba(15,23,42,.3)}
.svc .ic{width:48px;height:48px;border-radius:14px;background:var(--soft);color:var(--accent);display:grid;place-items:center}
.svc .ic svg{width:24px;height:24px}
.svc h3{font-size:19px;margin-top:20px;letter-spacing:-.015em;font-weight:700}
.svc p{margin-top:8px;color:var(--muted);font-size:15px}
.why{background:var(--surface)}
.facts{display:grid;gap:16px;margin-top:40px;grid-template-columns:1fr 1fr}
@media (min-width:1000px){.facts{grid-template-columns:repeat(4,1fr);gap:20px}}
.fact{background:#fff;border-radius:20px;padding:24px;border:1px solid var(--line)}
.fact strong{display:block;font-size:clamp(28px,6vw,40px);font-weight:800;letter-spacing:-.03em;line-height:1.1;color:var(--ink)}
.fact span{display:block;margin-top:8px;color:var(--muted);font-size:14px;font-weight:600}
.about .grid{display:grid;gap:32px}
@media (min-width:900px){.about .grid{grid-template-columns:.9fr 1.1fr;gap:64px}}
.about p{font-size:17px;color:#334155}
.about p+p{margin-top:14px}
.revs{display:grid;gap:16px;margin-top:40px}
@media (min-width:900px){.revs{grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px}}
.rev{border:1px solid var(--line);border-radius:20px;padding:24px;background:#fff}
.rev .stars{display:flex;gap:2px;color:#F5A524}.rev .stars svg{width:18px;height:18px}.rev .stars .off{color:#CBD5E1}
.rev blockquote{margin-top:16px;font-size:17px;line-height:1.55;font-weight:500}
.rev figcaption{margin-top:16px;display:flex;align-items:center;gap:10px;font-size:14px;font-weight:700;color:var(--muted)}
.rev .av{width:32px;height:32px;border-radius:50%;background:var(--soft);color:var(--accent);display:grid;place-items:center;font-size:13px;font-weight:800}
.visit .grid{display:grid;gap:16px;margin-top:40px}
@media (min-width:900px){.visit .grid{grid-template-columns:1fr 1fr;gap:20px}}
.box{border:1px solid var(--line);border-radius:20px;padding:24px 28px}
.box h3{font-size:19px;font-weight:700;display:flex;align-items:center;gap:10px}
.box h3 svg{width:22px;height:22px;color:var(--accent)}
.box .hours{margin-top:12px;font-size:15px}
.box .hours tr{border-bottom:1px solid var(--line)}.box .hours tr:last-child{border-bottom:0}
.box .hours tr.is-today{font-weight:800;color:var(--accent)}
.box .addr{margin-top:12px;color:#334155}
.box .btns{display:flex;flex-wrap:wrap;gap:10px;margin-top:20px}
.cta{padding:0 0 64px}
@media (min-width:900px){.cta{padding:0 0 96px}}
.cta .inner{background:var(--accent);color:var(--on-accent);border-radius:28px;padding:48px 28px;text-align:center;position:relative;overflow:hidden}
.cta .inner::after{content:"";position:absolute;width:420px;height:420px;border-radius:50%;border:56px solid rgba(255,255,255,.08);right:-160px;top:-180px}
.cta h2{font-size:clamp(30px,6vw,48px);max-width:18ch;margin:0 auto;position:relative}
.cta p{margin-top:12px;opacity:.9;font-size:17px;position:relative}
.cta .btn{margin-top:28px;background:#fff;color:var(--ink);position:relative}
footer{border-top:1px solid var(--line);padding:32px 0;color:var(--muted);font-size:14px}
footer .wrap{display:flex;flex-wrap:wrap;gap:12px 24px;justify-content:space-between;align-items:center}
.actionbar{background:rgba(255,255,255,.96);backdrop-filter:blur(10px);border-top:1px solid var(--line)}
.actionbar a{background:var(--surface);color:var(--ink)}
.actionbar .ab-call{background:var(--accent);color:var(--on-accent)}
`;
}

function hero(ctx: Ctx): string {
  const { business, content } = ctx;
  const rating = ratingText(business);
  return `<header class="top"><div class="wrap">
  <a class="brand" href="#top"><span class="mark" aria-hidden="true">${esc(ctx.monogram)}</span><span>${esc(business.name)}</span></a>
  <nav aria-label="Sections"><a href="#services">Services</a><a href="#reviews">Reviews</a><a href="#visit">Hours &amp; location</a></nav>
  ${ctx.tel ? `<a class="btn btn-primary btn-sm call" href="${safeUrl(ctx.tel)}">${ICONS.phone}Call now</a>` : ""}
</div></header>
<section class="hero" id="top" aria-labelledby="hero-title"><div class="wrap grid">
  <div>
    ${rating && business.rating ? `<p class="badge hero-in"><span class="stars" aria-hidden="true">${stars(business.rating)}</span><span>${esc(business.rating.toFixed(1))}</span><span class="count">${esc(business.reviewCount)} reviews</span></p>` : ""}
    <h1 id="hero-title" class="hero-in d1">${esc(content.headline)}</h1>
    <p class="sub hero-in d2">${esc(content.subheadline)}</p>
    <div class="btns hero-in d3">
      ${ctx.tel ? `<a class="btn btn-primary" href="${safeUrl(ctx.tel)}">${ICONS.phone}Call now</a>` : ""}
      <a class="btn btn-outline" href="${safeUrl(ctx.maps)}" target="_blank" rel="noopener">${ICONS.directions}Directions</a>
    </div>
    ${business.hours ? `<p class="today hero-in d3">${ICONS.clock}<span data-today-hours>Open today</span></p>` : ""}
  </div>
  <aside class="panel hero-in d2" data-slot="hero-photo" aria-label="Contact details">
    <span class="mark" aria-hidden="true">${esc(ctx.monogram)}</span>
    <h2>${esc(business.name)}</h2>
    <p class="cat">${esc(business.category)} in ${esc(business.city)}</p>
    <dl>
      <div><dt>${ICONS.pin}<span class="sr-only">Address</span></dt><dd>${esc(business.address)}</dd></div>
      ${ctx.phone ? `<div><dt>${ICONS.phone}<span class="sr-only">Phone</span></dt><dd><a href="${safeUrl(ctx.tel ?? "")}">${esc(ctx.phone)}</a></dd></div>` : ""}
      ${business.hours ? `<div><dt>${ICONS.clock}<span class="sr-only">Hours</span></dt><dd><a href="#visit">See opening hours</a></dd></div>` : ""}
    </dl>
  </aside>
</div></section>`;
}

function services(ctx: Ctx): string {
  return `<section class="services" id="services" aria-labelledby="svc-title"><div class="wrap">
  <span class="eyebrow">Services</span>
  <h2 id="svc-title" class="sec-title">What ${esc(ctx.business.name)} can help with</h2>
  <ul class="grid">${ctx.content.services
    .map(
      (service) =>
        `<li class="svc"><span class="ic">${serviceIcon(service.name)}</span><h3>${esc(service.name)}</h3><p>${esc(service.description)}</p></li>`,
    )
    .join("")}</ul>
</div></section>`;
}

function why(ctx: Ctx): string {
  const { business } = ctx;
  const facts: Array<[string, string]> = [];
  if (business.rating) facts.push([`${business.rating.toFixed(1)} ★`, "Average customer rating"]);
  if (business.reviewCount) facts.push([String(business.reviewCount), "Customer reviews"]);
  const days = openDays(business);
  if (days) facts.push([days === 7 ? "7 days" : `${days} days`, days === 7 ? "Open every day" : "Open each week"]);
  facts.push([areaName(business), `Based in ${business.city}`]);
  return `<section class="why" aria-labelledby="why-title"><div class="wrap">
  <span class="eyebrow">Why choose us</span>
  <h2 id="why-title" class="sec-title">The facts, at a glance</h2>
  <div class="facts">${facts
    .map(([value, label]) => `<div class="fact"><strong>${esc(value)}</strong><span>${esc(label)}</span></div>`)
    .join("")}</div>
</div></section>`;
}

function about(ctx: Ctx): string {
  return `<section class="about" aria-labelledby="about-title"><div class="wrap grid">
  <div><span class="eyebrow">About</span><h2 id="about-title" class="sec-title">${esc(ctx.content.about.title)}</h2></div>
  <div>${paragraphs(ctx.content.about.body)}</div>
</div></section>`;
}

function reviews(ctx: Ctx): string {
  const items = ctx.content.reviewHighlights;
  if (items.length === 0) return "";
  const ratingByAuthor = new Map(ctx.business.reviews.map((review) => [review.author, review.rating]));
  return `<section class="reviews" id="reviews" aria-labelledby="rev-title"><div class="wrap">
  <span class="eyebrow">Reviews</span>
  <h2 id="rev-title" class="sec-title">What customers say</h2>
  <div class="revs reveal">${items
    .map((item) => {
      const fullName = [...ratingByAuthor.keys()].find((name) => name.startsWith(item.author.split(" ")[0]));
      const rating = (fullName && ratingByAuthor.get(fullName)) || 5;
      return `<figure class="rev"><span class="stars" aria-label="${rating} out of 5 stars">${stars(rating)}</span><blockquote>${esc(item.quote)}</blockquote><figcaption><span class="av" aria-hidden="true">${esc(item.author.charAt(0))}</span>${esc(item.author)}</figcaption></figure>`;
    })
    .join("")}</div>
</div></section>`;
}

function visit(ctx: Ctx): string {
  const hours = hoursTable(ctx);
  return `<section class="visit" id="visit" aria-labelledby="visit-title"><div class="wrap">
  <span class="eyebrow">Hours &amp; location</span>
  <h2 id="visit-title" class="sec-title">Find ${esc(ctx.business.name)}</h2>
  <div class="grid">
    ${hours ? `<div class="box"><h3>${ICONS.clock}Opening hours</h3>${hours}</div>` : ""}
    <div class="box"><h3>${ICONS.pin}Location</h3><p class="addr">${esc(ctx.business.address)}</p>
      <div class="btns"><a class="btn btn-outline btn-sm" href="${safeUrl(ctx.maps)}" target="_blank" rel="noopener">${ICONS.directions}Get directions</a>${
        ctx.tel ? `<a class="btn btn-outline btn-sm" href="${safeUrl(ctx.tel)}">${ICONS.phone}${esc(ctx.phone)}</a>` : ""
      }</div></div>
  </div>
</div></section>`;
}

function cta(ctx: Ctx): string {
  const { content } = ctx;
  return `<section class="cta" aria-labelledby="cta-title"><div class="wrap"><div class="inner">
  <h2 id="cta-title">${esc(content.ctaHeadline)}</h2>
  ${ctx.phone ? `<p>${esc(ctx.phone)}</p>` : ""}
  ${ctx.tel
    ? `<a class="btn" href="${safeUrl(ctx.tel)}">${ICONS.phone}${esc(content.ctaLabel)}</a>`
    : `<a class="btn" href="${safeUrl(ctx.maps)}" target="_blank" rel="noopener">${ICONS.directions}Get directions</a>`}
</div></div></section>`;
}

export const renderModern: TemplateRender = (content, business, opts) => {
  const ctx = context(content, business, opts);
  return `${head(ctx, { fontsHref: FONTS, css: css(ctx.accent), themeColor: "#ffffff", faviconBg: ctx.accent, faviconFg: onAccent(ctx.accent) })}
<body>
${hero(ctx)}
<main>
${services(ctx)}
${why(ctx)}
${reviews(ctx)}
${about(ctx)}
${visit(ctx)}
${cta(ctx)}
</main>
<footer><div class="wrap"><span>© ${ctx.year} ${esc(business.name)}</span><span>${esc(business.address)}</span></div></footer>
${actionBar(ctx)}
${pageScript(business.hours)}
</body>
</html>`;
};

export const modernTemplate: TemplateDefinition = {
  id: "modern",
  name: "Modern",
  description: "Trust signals first and tap-to-call, for trades, clinics and services.",
  render: renderModern,
};
