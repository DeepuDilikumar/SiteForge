import { MockBillingProvider } from "./mock";

export type PriceInfo = { amount: number; currency: string; formatted: string };

/**
 * Billing boundary. A real provider (Stripe Checkout, Razorpay Subscriptions) implements this:
 * `confirmUpgrade` becomes "create a checkout session and wait for its webhook".
 */
export interface BillingProvider {
  readonly kind: "mock" | "stripe" | "razorpay";
  readonly testMode: boolean;
  confirmUpgrade(userId: string): Promise<void>;
  cancel(userId: string): Promise<void>;
}

export function getBillingProvider(): BillingProvider {
  // TODO(billing): return a Stripe or Razorpay provider when its keys are configured.
  return new MockBillingProvider();
}

export function proPrice(): PriceInfo {
  const amount = Number(process.env.PRO_PRICE_MONTHLY || 19);
  const currency = (process.env.PRO_CURRENCY || "USD").toUpperCase();
  const formatted = new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount);
  return { amount, currency, formatted };
}
