import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

export function createDb(url: string, authToken?: string) {
  const client = createClient({ url, authToken: authToken || undefined });
  return drizzle(client, { schema });
}

export type Db = ReturnType<typeof createDb>;

const globalForDb = globalThis as unknown as { siteforgeDb?: Db };

export const db: Db =
  globalForDb.siteforgeDb ??
  createDb(process.env.DATABASE_URL ?? "file:local.db", process.env.DATABASE_AUTH_TOKEN);

if (process.env.NODE_ENV !== "production") globalForDb.siteforgeDb = db;

/** True when a query failed because migrations haven't been applied to this database. */
export function isMissingSchemaError(error: unknown): boolean {
  for (let current: unknown = error; current; current = (current as { cause?: unknown }).cause) {
    if (current instanceof Error && /no such table/i.test(current.message)) return true;
    if (typeof current !== "object") break;
  }
  return false;
}

export const MISSING_SCHEMA_MESSAGE =
  "The database isn't set up yet. Stop the server, run `npm run db:migrate` (and `npm run db:seed` for demo accounts), then start it again.";
