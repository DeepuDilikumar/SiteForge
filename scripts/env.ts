import { existsSync, readFileSync } from "node:fs";

/** Load .env.local and .env without overriding variables already set. Works on any Node 20+. */
function load(file: string) {
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!match) continue;
    const [, key, raw] = match;
    const value = raw.replace(/^(['"])(.*)\1$/, "$2");
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

for (const file of [".env.local", ".env"]) {
  if (existsSync(file)) load(file);
}
