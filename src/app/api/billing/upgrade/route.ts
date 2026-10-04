import { handle, ok, requireApiUser } from "@/lib/api";
import { getBillingProvider } from "@/lib/billing/provider";

export const POST = handle(async () => {
  const user = await requireApiUser();
  await getBillingProvider().confirmUpgrade(user.id);
  return ok({ plan: "pro" as const });
});
