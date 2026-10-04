import "./env";
import { eq, inArray } from "drizzle-orm";
import { hashPassword } from "better-auth/crypto";
import { mockSiteContent } from "../src/lib/ai/mock";
import { recommendAccent, recommendTemplate } from "../src/lib/categories";
import { createDb } from "../src/lib/db";
import { account, business, lead, site, user, type LeadStatus } from "../src/lib/db/schema";
import { businessIdFor } from "../src/lib/places/provider";
import { generateMockBusinesses } from "../src/lib/places/mock";
import { slugify } from "../src/lib/util/text";

const db = createDb(process.env.DATABASE_URL ?? "file:local.db", process.env.DATABASE_AUTH_TOKEN);
const PASSWORD = "demo1234";

async function upsertUser(email: string, name: string, plan: "free" | "pro") {
  const existing = await db.query.user.findFirst({ where: eq(user.email, email) });
  if (existing) {
    await db.delete(site).where(eq(site.userId, existing.id));
    await db.delete(lead).where(eq(lead.userId, existing.id));
    await db.update(user).set({ plan, name }).where(eq(user.id, existing.id));
    return existing.id;
  }
  const id = crypto.randomUUID();
  await db.insert(user).values({ id, email, name, plan, emailVerified: true });
  await db.insert(account).values({
    id: crypto.randomUUID(),
    accountId: id,
    providerId: "credential",
    userId: id,
    password: await hashPassword(PASSWORD),
  });
  return id;
}

async function main() {
  await upsertUser("free@demo.dev", "Fathima Rasheed", "free");
  const proId = await upsertUser("pro@demo.dev", "Arjun Menon", "pro");

  const picks: Array<{ what: string; where: string; index: number; status: LeadStatus; publish: boolean; daysAgo: number }> = [
    { what: "bakeries", where: "Trivandrum", index: 0, status: "contacted", publish: true, daysAgo: 6 },
    { what: "plumbers", where: "Kochi", index: 1, status: "site_ready", publish: false, daysAgo: 2 },
    { what: "cafes", where: "Bangalore", index: 0, status: "won", publish: false, daysAgo: 12 },
    { what: "dentists", where: "Austin", index: 2, status: "lost", publish: false, daysAgo: 20 },
  ];

  const now = Date.now();
  for (const pick of picks) {
    const records = generateMockBusinesses({ what: pick.what, where: pick.where }).filter((record) => record.websiteStatus !== "has_site");
    const record = records[pick.index];
    const id = businessIdFor(record.placeId);
    const fetchedAt = new Date();
    await db
      .insert(business)
      .values({ ...record, id, fetchedAt })
      .onConflictDoUpdate({ target: business.placeId, set: { ...record, fetchedAt } });

    const stored = { ...record, id, fetchedAt };
    const template = recommendTemplate(record.category);
    const created = new Date(now - pick.daysAgo * 24 * 3600 * 1000);
    const leadId = crypto.randomUUID();
    await db.insert(lead).values({ id: leadId, userId: proId, businessId: id, status: pick.status, createdAt: created, updatedAt: created });
    await db.insert(site).values({
      id: crypto.randomUUID(),
      userId: proId,
      businessId: id,
      leadId,
      template,
      tone: "warm",
      content: mockSiteContent({ business: stored, template, tone: "warm" }),
      overrides: {},
      accentColor: recommendAccent(record.category),
      publishedSlug: pick.publish ? slugify(`${record.name} ${record.city}`) : null,
      publishedAt: pick.publish ? created : null,
      createdAt: created,
      updatedAt: created,
    });
  }

  const published = await db.query.site.findMany({ where: inArray(site.userId, [proId]), columns: { publishedSlug: true } });
  console.log("Seeded demo accounts:");
  console.log("  free@demo.dev / demo1234  (free plan, empty pipeline)");
  console.log("  pro@demo.dev  / demo1234  (pro plan, 4 leads)");
  const slug = published.find((row) => row.publishedSlug)?.publishedSlug;
  if (slug) console.log(`  Published site: /s/${slug}`);
}

main().catch((error: unknown) => {
  console.error("Seed failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
