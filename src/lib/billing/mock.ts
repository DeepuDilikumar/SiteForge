import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import type { BillingProvider } from "./provider";

// TODO(billing): stub only. No payment is taken; the plan flips immediately.
export class MockBillingProvider implements BillingProvider {
  readonly kind = "mock" as const;
  readonly testMode = true;

  async confirmUpgrade(userId: string): Promise<void> {
    await db.update(user).set({ plan: "pro", updatedAt: new Date() }).where(eq(user.id, userId));
  }

  async cancel(userId: string): Promise<void> {
    await db.update(user).set({ plan: "free", updatedAt: new Date() }).where(eq(user.id, userId));
  }
}
