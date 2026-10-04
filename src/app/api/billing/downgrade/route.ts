import { handle, ok, requireApiUser } from "@/lib/api";
import { getBillingProvider } from "@/lib/billing/provider";

export const POST = handle(async () => {
  const user = await requireApiUser();
  await getBillingProvider().cancel(user.id);
  return ok({ plan: "free" as const });
});
