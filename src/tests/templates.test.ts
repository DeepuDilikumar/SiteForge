import { describe, expect, it } from "vitest";
import { mockSiteContent } from "@/lib/ai/mock";
import { TEMPLATE_IDS } from "@/lib/db/schema";
import { injectWatermark, renderSite } from "@/lib/render";
import { esc } from "@/lib/templates/shared";
import { variedBusinesses } from "./fixtures";

function visibleText(html: string) {
  return html.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<style[\s\S]*?<\/style>/g, "");
}

describe.each(TEMPLATE_IDS)("%s template", (template) => {
  it.each(variedBusinesses().map((business) => [business.name, business] as const))("renders %s cleanly", (_name, business) => {
    const content = mockSiteContent({ business, template, tone: "warm" });
    const html = renderSite({ template, content, business, accent: "#E37400", watermark: false });

    expect(html.startsWith("<!doctype html>")).toBe(true);
    expect(html).toMatch(/<html lang="en-(IN|US|GB|AU)">/);
    expect(html).toContain(`<title>${esc(content.seo.title)}</title>`);
    expect(html).toContain('property="og:title"');
    expect(html).toContain('rel="icon"');

    const text = visibleText(html);
    expect(text).not.toMatch(/\bundefined\b|\bnull\b|\bNaN\b|\[object Object\]/);
    expect(text.toLowerCase()).not.toContain("lorem");
    expect(text).not.toMatch(/=""\s*>|href=""/);

    expect(html).toContain(esc(content.headline));
    expect(html).toContain(esc(content.subheadline));
    for (const service of content.services) expect(html).toContain(esc(service.name));
    for (const highlight of content.reviewHighlights) expect(html).toContain(esc(highlight.quote));
    expect(html).toContain(esc(business.address));
  });

  it("escapes hostile business data", () => {
    const business = variedBusinesses()[4];
    const content = mockSiteContent({ business, template, tone: "warm" });
    const html = renderSite({ template, content, business, accent: "#1A73E8", watermark: false });
    expect(html).not.toContain('<script>alert("x")</script>');
    expect(html).not.toContain("<img src=x");
    expect(html).not.toContain("<b>cut</b>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("highlights today's hours with inline script and offers the mobile action bar", () => {
    const business = variedBusinesses()[0];
    const html = renderSite({ template, content: mockSiteContent({ business, template, tone: "warm" }), business, accent: "#0B8043", watermark: false });
    expect(html).toContain('tr[data-day="');
    expect(html).toContain('class="actionbar"');
    expect(html).toContain('href="tel:+91');
    expect(html).toContain("https://wa.me/91");
  });
});

describe("watermark", () => {
  it("is injected server-side only when asked", () => {
    const business = variedBusinesses()[1];
    const content = mockSiteContent({ business, template: "modern", tone: "warm" });
    const free = renderSite({ template: "modern", content, business, accent: "#1A73E8", watermark: true });
    const pro = renderSite({ template: "modern", content, business, accent: "#1A73E8", watermark: false });
    expect(free).toContain("Built with SiteForge");
    expect(pro).not.toContain("Built with SiteForge");
    expect(injectWatermark("<body></body>")).not.toContain("Built with SiteForge");
  });
});

describe("overrides", () => {
  it("uses the operator's phone and hours", () => {
    const business = variedBusinesses()[1];
    const content = mockSiteContent({ business, template: "modern", tone: "warm" });
    const html = renderSite({
      template: "modern",
      content,
      business,
      overrides: { phone: "(512) 555-0199", hours: ["Closed", "1–2", "1–2", "1–2", "1–2", "1–2", "Closed"] },
      accent: "#1A73E8",
      watermark: false,
    });
    expect(html).toContain("(512) 555-0199");
    expect(html).toContain("tel:+15125550199");
  });
});
