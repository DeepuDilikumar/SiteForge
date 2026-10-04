import { esc } from "@/lib/templates/shared";

/** A small, branded page for missing or unpublished sites. Self-contained HTML. */
export function notFoundPage(message = "This page isn't published right now."): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>Page not found · SiteForge</title>
<style>
:root{color-scheme:light dark}
body{margin:0;min-height:100vh;display:grid;place-items:center;font:400 16px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif;background:#fff;color:#202124;padding:24px;box-sizing:border-box}
@media (prefers-color-scheme:dark){body{background:#202124;color:#e8eaed}p{color:#9aa0a6!important}}
main{text-align:center;max-width:420px}
.mark{display:inline-flex;align-items:center;gap:8px;font-weight:500;font-size:20px}
h1{font-size:24px;font-weight:500;margin:32px 0 8px}
p{color:#5f6368;margin:0}
</style></head><body><main>
<span class="mark"><svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path fill="#1A73E8" d="M12 2l2.2 6.6L21 11l-6.8 2.4L12 20l-2.2-6.6L3 11l6.8-2.4z"/></svg>SiteForge</span>
<h1>Page not found</h1><p>${esc(message)}</p></main></body></html>`;
}
