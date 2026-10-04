import "./env";
import { migrate } from "drizzle-orm/libsql/migrator";
import { createDb } from "../src/lib/db";

async function main() {
  const url = process.env.DATABASE_URL ?? "file:local.db";
  const db = createDb(url, process.env.DATABASE_AUTH_TOKEN);
  await migrate(db, { migrationsFolder: "drizzle" });
  console.log(`Migrations applied to ${url.startsWith("file:") ? url : "remote database"}.`);
}

main().catch((error: unknown) => {
  console.error("Migration failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
