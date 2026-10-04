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
