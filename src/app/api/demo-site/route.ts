import { z } from "zod";
import { TEMPLATE_IDS } from "@/lib/db/schema";
import { demoSite } from "@/lib/demo";
import { siteHtmlResponse } from "@/lib/html-response";
import { renderSite } from "@/lib/render";

export function GET(request: Request) {
  const template = z.enum(TEMPLATE_IDS).catch("legacy").parse(new URL(request.url).searchParams.get("template"));
  const { business, content, accent } = demoSite(template);
  return siteHtmlResponse(renderSite({ template, business, content, accent, watermark: false }));
}
