import { sql } from "drizzle-orm";
import {
  index,
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import type { SiteContent, SiteOverrides } from "@/lib/ai/schemas";
import type { Review } from "@/lib/places/types";

export const PLANS = ["free", "pro"] as const;
export const WEBSITE_STATUSES = ["none", "social_only", "weak", "has_site"] as const;
export const LEAD_STATUSES = ["site_ready", "contacted", "won", "lost"] as const;
export const TEMPLATE_IDS = ["legacy", "modern", "bold"] as const;
export const TONES = ["warm", "professional", "bold"] as const;
export const CHANNELS = ["whatsapp", "email"] as const;

const createdAt = () =>
  integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`);
const updatedAt = () =>
  integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => new Date());

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
  image: text("image"),
  plan: text("plan", { enum: PLANS }).notNull().default("free"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const session = sqliteTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (t) => [index("session_user_idx").on(t.userId)],
);

export const account = sqliteTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp_ms" }),
    refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp_ms" }),
    scope: text("scope"),
    password: text("password"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("account_user_idx").on(t.userId)],
);

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const business = sqliteTable("business", {
  id: text("id").primaryKey(),
  placeId: text("place_id").notNull().unique(),
  source: text("source", { enum: ["mock", "google"] }).notNull(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  countryCode: text("country_code").notNull(),
  phone: text("phone"),
  rating: real("rating"),
  reviewCount: integer("review_count").notNull().default(0),
  reviews: text("reviews", { mode: "json" }).$type<Review[]>().notNull(),
  hours: text("hours", { mode: "json" }).$type<string[] | null>(),
  mapsUrl: text("maps_url").notNull(),
  websiteUri: text("website_uri"),
  websiteStatus: text("website_status", { enum: WEBSITE_STATUSES }).notNull(),
  lat: real("lat"),
  lng: real("lng"),
  fetchedAt: integer("fetched_at", { mode: "timestamp_ms" }).notNull(),
});

export const lead = sqliteTable(
  "lead",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    businessId: text("business_id")
      .notNull()
      .references(() => business.id),
    status: text("status", { enum: LEAD_STATUSES }).notNull().default("site_ready"),
    notes: text("notes").notNull().default(""),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("lead_user_business_idx").on(t.userId, t.businessId)],
);

export const site = sqliteTable(
  "site",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    businessId: text("business_id")
      .notNull()
      .references(() => business.id),
    leadId: text("lead_id")
      .notNull()
      .references(() => lead.id, { onDelete: "cascade" }),
    template: text("template", { enum: TEMPLATE_IDS }).notNull(),
    tone: text("tone", { enum: TONES }).notNull(),
    content: text("content", { mode: "json" }).$type<SiteContent>().notNull(),
    overrides: text("overrides", { mode: "json" }).$type<SiteOverrides>().notNull(),
    accentColor: text("accent_color").notNull(),
    regenerationsUsed: integer("regenerations_used").notNull().default(0),
    publishedSlug: text("published_slug").unique(),
    publishedAt: integer("published_at", { mode: "timestamp_ms" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("site_user_created_idx").on(t.userId, t.createdAt)],
);

export const outreach = sqliteTable("outreach", {
  id: text("id").primaryKey(),
  siteId: text("site_id")
    .notNull()
    .references(() => site.id, { onDelete: "cascade" }),
  channel: text("channel", { enum: CHANNELS }).notNull(),
  subject: text("subject"),
  body: text("body").notNull(),
  createdAt: createdAt(),
});

export type Plan = (typeof PLANS)[number];
export type WebsiteStatus = (typeof WEBSITE_STATUSES)[number];
export type LeadStatus = (typeof LEAD_STATUSES)[number];
export type TemplateId = (typeof TEMPLATE_IDS)[number];
export type Tone = (typeof TONES)[number];
export type Channel = (typeof CHANNELS)[number];
export type UserRow = typeof user.$inferSelect;
export type BusinessRow = typeof business.$inferSelect;
export type LeadRow = typeof lead.$inferSelect;
export type SiteRow = typeof site.$inferSelect;
