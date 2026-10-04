import { SITE_CSP } from "@/lib/render";

export function siteHtmlResponse(html: string, status = 200, frameAncestors = "'self'") {
  return new Response(html, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Security-Policy": `${SITE_CSP}; frame-ancestors ${frameAncestors}`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": status === 200 ? "public, max-age=60" : "no-store",
    },
  });
}
