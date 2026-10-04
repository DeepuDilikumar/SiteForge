import JSZip from "jszip";
import { fail, handle, requireApiUser } from "@/lib/api";
import { db } from "@/lib/db";
import { canExport, loadEntitlementUser } from "@/lib/entitlements";
import { renderSite } from "@/lib/render";
import { loadOwnedSite } from "@/lib/sites";
import { slugify } from "@/lib/util/text";

function readme(name: string): string {
  return `${name} — website files
${"=".repeat(name.length + 18)}

index.html is the complete site: styles and scripts are inside the file, and fonts load
from Google Fonts. There is nothing to build or install.

To put it online, pick one:

1. Netlify Drop
   Go to https://app.netlify.com/drop and drag this folder onto the page.
   You get a live link straight away; add your own domain in Site settings.

2. Cloudflare Pages
   In the Cloudflare dashboard open Workers & Pages > Create > Pages > Upload assets,
   then upload this folder.

3. Any static host
   Upload index.html to the web root of any host (shared hosting, S3, GitHub Pages).

To edit the text later, open index.html in any text editor and change the words between
the tags, then upload it again.
`;
}

export const GET = handle(async (_request: Request, { params }: { params: Promise<{ id: string }> }) => {
  const user = await requireApiUser();
  const { id } = await params;
  const owned = await loadOwnedSite(id, user.id);
  const entitlement = await loadEntitlementUser(db, user.id);
  if (!canExport(entitlement)) return fail("pro_required", "Downloading code is part of Pro.");

  const html = renderSite({
    template: owned.site.template,
    content: owned.site.content,
    business: owned.business,
    overrides: owned.site.overrides,
    accent: owned.site.accentColor,
    watermark: false,
  });
  const folder = slugify(`${owned.business.name} ${owned.business.city}`) || "site";
  const zip = new JSZip();
  zip.file(`${folder}/index.html`, html);
  zip.file(`${folder}/README.txt`, readme(owned.business.name));
  const archive = await zip.generateAsync({ type: "uint8array", compression: "DEFLATE" });
  return new Response(archive.buffer as ArrayBuffer, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${folder}.zip"`,
      "Cache-Control": "no-store",
    },
  });
});
