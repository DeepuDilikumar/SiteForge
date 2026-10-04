import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { username } from "better-auth/plugins";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { configuredAppUrl, trustedOrigins } from "@/lib/app-url";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";

/** Production servers must set BETTER_AUTH_SECRET; development and `next build` may use a placeholder. */
const requiresRealSecret = process.env.NODE_ENV === "production" && process.env.NEXT_PHASE !== "phase-production-build";

export const auth = betterAuth({
  baseURL: configuredAppUrl(),
  trustedOrigins: trustedOrigins(),
  secret: process.env.BETTER_AUTH_SECRET || (requiresRealSecret ? undefined : "siteforge-development-secret-not-for-production"),
  database: drizzleAdapter(db, { provider: "sqlite", schema }),
  emailAndPassword: { enabled: true, minPasswordLength: 8, autoSignIn: true },
  user: {
    additionalFields: {
      plan: { type: "string", required: false, defaultValue: "free", input: false },
    },
  },
  plugins: [username(), nextCookies()],
});

export type SessionUser = {
  id: string;
  name: string;
  email: string;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  return { id: session.user.id, name: session.user.name, email: session.user.email };
}

/** For pages: send signed-out visitors to sign in and bring them back afterwards. */
export async function requireUser(next: string): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return user;
}
