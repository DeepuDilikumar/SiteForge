import {
  actionBar,
  baseCss,
  context,
  esc,
  head,
  hoursTable,
  ICONS,
  pageScript,
  paragraphs,
  safeUrl,
  type Ctx,
} from "./shared";
import type { TemplateDefinition, TemplateRender } from "./types";

const FONTS =
  "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Instrument+Sans:wght@400;500;600&display=swap";

function css(accent: string): string {
  return `${baseCss(accent)}
:root{--ink:#000;--muted:#4d4d4d;--line:#000}
body{font-family:"Instrument Sans",system-ui,sans-serif;color:var(--ink);background:#fff;font-size:17px;line-height:1.6}
.disp{font-family:"Bricolage Grotesque",system-ui,sans-serif;font-optical-sizing:auto;font-weight:700;letter-spacing:-.045em;line-height:.92}
.top .wrap{display:flex;align-items:center;justify-content:space-between;min-height:72px;gap:16px}
.brand{font-family:"Bricolage Grotesque",system-ui,sans-serif;font-weight:700;font-size:20px;letter-spacing:-.02em;text-decoration:none}
.top .call{display:none}
@media (min-width:900px){.top .call{display:inline-flex}}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;min-height:56px;padding:0 28px;border-radius:999px;font-weight:600;font-size:17px;text-decoration:none;transition:transform .2s var(--ease),background-color .2s var(--ease)}
.btn svg{width:20px;height:20px}
.btn:active{transform:scale(.98)}
.btn-ink{background:#000;color:#fff}.btn-ink:hover{background:#262626}
.btn-sm{min-height:44px;padding:0 20px;font-size:15px}
.link{display:inline-flex;align-items:center;gap:8px;font-weight:600;font-size:17px;text-decoration:none;border-bottom:2px solid currentColor;padding:4px 0}
.link svg{width:20px;height:20px;transition:transform .2s var(--ease)}
.link:hover svg{transform:translateX(4px)}
.hero{padding:8px 0 64px}
.hero .grid{display:grid;gap:32px}
@media (min-width:900px){.hero{padding:24px 0 112px}.hero .grid{grid-template-columns:7fr 5fr;gap:48px;align-items:stretch}}
.field{background:var(--accent);color:var(--on-accent);border-radius:28px;min-height:280px;position:relative;overflow:hidden;order:-1}
@media (min-width:900px){.field{order:0;min-height:560px;border-radius:36px}}
.field .initial{position:absolute;right:-.06em;bottom:-.24em;font-family:"Bricolage Grotesque",system-ui,sans-serif;font-weight:800;font-size:clamp(300px,62vw,560px);line-height:1;letter-spacing:-.06em;opacity:.95}
.field .sticker{position:absolute;left:20px;top:20px;width:112px;height:112px;border-radius:50%;background:#fff;color:#000;display:grid;place-content:center;text-align:center;transform:rotate(-8deg);box-shadow:0 10px 30px -12px rgba(0,0,0,.4)}
@media (min-width:900px){.field .sticker{left:28px;top:28px;width:132px;height:132px}}
.sticker strong{font-family:"Bricolage Grotesque",system-ui,sans-serif;font-size:34px;line-height:1;letter-spacing:-.04em}
.sticker span{font-size:12px;font-weight:600;line-height:1.3;margin-top:4px}
.hero .copy{display:flex;flex-direction:column;justify-content:flex-end}
.hero .tag{font-weight:600;font-size:15px;display:flex;gap:10px;align-items:center}
.hero .tag::before{content:"";width:28px;height:2px;background:#000}
.hero h1{font-size:clamp(56px,14vw,124px);margin-top:20px;max-width:9.5ch;overflow-wrap:break-word;hyphens:auto}
.hero .sub{margin-top:24px;font-size:20px;line-height:1.5;max-width:34ch;color:#1a1a1a}
.hero .btns{display:flex;flex-wrap:wrap;gap:20px 28px;align-items:center;margin-top:36px}
.strip{border-top:2px solid #000;border-bottom:2px solid #000;padding:16px 0;overflow:hidden}
.strip ul{display:flex;flex-wrap:wrap;gap:8px 28px;font-family:"Bricolage Grotesque",system-ui,sans-serif;font-weight:600;font-size:clamp(20px,3.6vw,30px);letter-spacing:-.03em}
.strip li{display:flex;align-items:center;gap:28px}
.strip li+li::before{content:"";width:12px;height:12px;border-radius:50%;background:var(--accent)}
section{padding:72px 0}
@media (min-width:900px){section{padding:120px 0}}
.about .grid{display:grid;gap:28px}
@media (min-width:900px){.about .grid{grid-template-columns:5fr 7fr;gap:64px}}
.about h2{font-size:clamp(40px,8vw,72px)}
.about .body p{font-size:21px;line-height:1.55}
.about .body p+p{margin-top:16px}
.services{padding-top:0}
.services h2{font-size:clamp(44px,9vw,88px)}
.rows{margin-top:48px;border-top:2px solid #000}
.row{display:grid;grid-template-columns:auto 1fr;gap:4px 20px;padding:28px 0;border-bottom:1px solid #000;align-items:baseline}
@media (min-width:900px){.row{grid-template-columns:96px 1fr 1fr;gap:32px;padding:36px 0}}
.row .num{font-family:"Bricolage Grotesque",system-ui,sans-serif;font-weight:700;font-size:18px;color:var(--accent);filter:saturate(1.1)}
.row h3{font-family:"Bricolage Grotesque",system-ui,sans-serif;font-weight:700;font-size:clamp(28px,5vw,44px);letter-spacing:-.035em;line-height:1}
.row p{grid-column:2;color:var(--muted);font-size:17px}
@media (min-width:900px){.row p{grid-column:3}}
.voices{background:var(--accent);color:var(--on-accent)}
.voices h2{font-size:clamp(40px,8vw,72px)}
.vgrid{display:grid;gap:40px;margin-top:56px}
@media (min-width:900px){.vgrid{grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:48px}}
.voice blockquote{font-family:"Bricolage Grotesque",system-ui,sans-serif;font-weight:600;font-size:clamp(24px,3.4vw,32px);line-height:1.15;letter-spacing:-.03em}
.voice blockquote::before{content:"\\201C"}
.voice blockquote::after{content:"\\201D"}
.voice figcaption{margin-top:20px;font-weight:600;font-size:15px;display:flex;align-items:center;gap:10px}
.voice figcaption::before{content:"";width:24px;height:2px;background:currentColor}
.visit .grid{display:grid;gap:48px}
@media (min-width:900px){.visit .grid{grid-template-columns:1fr 1fr;gap:80px}}
.visit h2{font-size:clamp(40px,8vw,72px)}
.visit .hours{margin-top:28px;font-size:18px}
.visit .hours tr{border-bottom:1px solid #000}
.visit .hours th,.visit .hours td{padding:14px 12px}
.visit .hours tr.is-today{background:var(--accent);color:var(--on-accent);font-weight:600}
.visit .addr{margin-top:28px;font-family:"Bricolage Grotesque",system-ui,sans-serif;font-weight:600;font-size:clamp(26px,4vw,36px);line-height:1.15;letter-spacing:-.03em}
.visit .btns{display:flex;flex-wrap:wrap;gap:20px 28px;align-items:center;margin-top:32px}
.final{border-top:2px solid #000}
.final h2{font-size:clamp(52px,12vw,140px);max-width:12ch}
.final .btns{margin-top:40px;display:flex;flex-wrap:wrap;gap:20px 28px;align-items:center}
footer{background:#000;color:#fff;padding:48px 0}
footer .wrap{display:grid;gap:20px}
@media (min-width:900px){footer .wrap{grid-template-columns:1fr auto;align-items:end}}
footer .name{font-family:"Bricolage Grotesque",system-ui,sans-serif;font-weight:700;font-size:clamp(36px,7vw,64px);letter-spacing:-.045em;line-height:.95}
footer p{color:rgba(255,255,255,.7);font-size:14px}
.actionbar{background:#fff;border-top:2px solid #000}
.actionbar a{border:2px solid #000;color:#000}
.actionbar .ab-call{background:#000;color:#fff}
`;
}

function hero(ctx: Ctx): string {
  const { business, content } = ctx;
  const initial = business.name.replace(/^(the|dr\.?)\s+/i, "").charAt(0).toUpperCase();
  const sticker =
    business.rating && business.reviewCount
      ? `<div class="sticker" aria-hidden="true"><strong>${esc(business.rating.toFixed(1))}★</strong><span>${esc(business.reviewCount)}<br>reviews</span></div>`
      : "";
  return `<header class="top"><div class="wrap"><a class="brand" href="#top">${esc(business.name)}</a>${
    ctx.tel ? `<a class="btn btn-ink btn-sm call" href="${safeUrl(ctx.tel)}">${ICONS.phone}Call</a>` : ""
  }</div></header>
<section class="hero" id="top" aria-labelledby="hero-title"><div class="wrap grid">
  <div class="copy">
    <p class="tag hero-in">${esc(business.category)}, ${esc(business.city)}</p>
    <h1 id="hero-title" class="disp hero-in d1">${esc(content.headline)}</h1>
    <p class="sub hero-in d2">${esc(content.subheadline)}</p>
    <div class="btns hero-in d3">
      ${ctx.tel ? `<a class="btn btn-ink" href="${safeUrl(ctx.tel)}">${ICONS.phone}${esc(content.ctaLabel)}</a>` : ""}
      <a class="link" href="${safeUrl(ctx.maps)}" target="_blank" rel="noopener">Directions${ICONS.arrow}</a>
    </div>
  </div>
  <div class="field hero-in" data-slot="hero-photo"><span class="initial" aria-hidden="true">${esc(initial)}</span>${
    business.rating && business.reviewCount
      ? `<span class="sr-only">Rated ${esc(business.rating.toFixed(1))} from ${esc(business.reviewCount)} reviews</span>`
      : ""
  }${sticker}</div>
</div></section>`;
}

function strip(ctx: Ctx): string {
  return `<div class="strip" aria-hidden="true"><div class="wrap"><ul>${ctx.content.services
    .slice(0, 4)
    .map((service) => `<li>${esc(service.name)}</li>`)
    .join("")}</ul></div></div>`;
}

function about(ctx: Ctx): string {
  const { about: section } = ctx.content;
  return `<section class="about" aria-labelledby="about-title"><div class="wrap grid">
  <h2 id="about-title" class="disp">${esc(section.title)}</h2>
  <div class="body">${paragraphs(section.body)}</div>
</div></section>`;
}

function services(ctx: Ctx): string {
  return `<section class="services" aria-labelledby="svc-title"><div class="wrap">
  <h2 id="svc-title" class="disp">What we do</h2>
  <ol class="rows">${ctx.content.services
    .map(
      (service, index) =>
        `<li class="row"><span class="num">${String(index + 1).padStart(2, "0")}</span><h3>${esc(service.name)}</h3><p>${esc(service.description)}</p></li>`,
    )
    .join("")}</ol>
</div></section>`;
}

function voices(ctx: Ctx): string {
  const items = ctx.content.reviewHighlights;
  if (items.length === 0) return "";
  return `<section class="voices" aria-labelledby="voices-title"><div class="wrap">
  <h2 id="voices-title" class="disp">Overheard</h2>
  <div class="vgrid reveal">${items
    .map((item) => `<figure class="voice"><blockquote>${esc(item.quote)}</blockquote><figcaption>${esc(item.author)}</figcaption></figure>`)
    .join("")}</div>
</div></section>`;
}

function visit(ctx: Ctx): string {
  const hours = hoursTable(ctx);
  return `<section class="visit" id="visit" aria-labelledby="visit-title"><div class="wrap grid">
  ${hours ? `<div><h2 id="visit-title" class="disp">Hours</h2>${hours}</div>` : ""}
  <div>${hours ? `<h2 class="disp">Find us</h2>` : `<h2 id="visit-title" class="disp">Find us</h2>`}
    <p class="addr">${esc(ctx.business.address)}</p>
    <div class="btns"><a class="btn btn-ink btn-sm" href="${safeUrl(ctx.maps)}" target="_blank" rel="noopener">${ICONS.directions}Get directions</a>${
      ctx.tel ? `<a class="link" href="${safeUrl(ctx.tel)}">${esc(ctx.phone)}${ICONS.arrow}</a>` : ""
    }</div>
  </div>
</div></section>`;
}

function final(ctx: Ctx): string {
  const { content } = ctx;
  return `<section class="final" aria-labelledby="final-title"><div class="wrap">
  <h2 id="final-title" class="disp">${esc(content.ctaHeadline)}</h2>
  <div class="btns">${
    ctx.tel
      ? `<a class="btn btn-ink" href="${safeUrl(ctx.tel)}">${ICONS.phone}${esc(content.ctaLabel)}</a>`
      : `<a class="btn btn-ink" href="${safeUrl(ctx.maps)}" target="_blank" rel="noopener">${ICONS.directions}Get directions</a>`
  }</div>
</div></section>`;
}

export const renderBold: TemplateRender = (content, business, opts) => {
  const ctx = context(content, business, opts);
  return `${head(ctx, { fontsHref: FONTS, css: css(ctx.accent), themeColor: ctx.accent, faviconBg: "#000000", faviconFg: "#ffffff" })}
<body>
${hero(ctx)}
<main>
${strip(ctx)}
${about(ctx)}
${services(ctx)}
${voices(ctx)}
${visit(ctx)}
${final(ctx)}
</main>
<footer><div class="wrap"><span class="name">${esc(business.name)}</span><p>${esc(business.address)}<br>© ${ctx.year} ${esc(business.name)}</p></div></footer>
${actionBar(ctx)}
${pageScript(business.hours)}
</body>
</html>`;
};

export const boldTemplate: TemplateDefinition = {
  id: "bold",
  name: "Bold",
  description: "Editorial and confident, for cafés, boutiques, studios and gyms.",
  render: renderBold,
};
