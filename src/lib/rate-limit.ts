/**
 * In-memory token bucket, per user and action.
 * Replace with a shared store (e.g. Redis or Upstash) before running more than one server instance.
 */
type Bucket = { tokens: number; updatedAt: number };

const buckets = new Map<string, Bucket>();

export type RateLimit = { capacity: number; refillPerMinute: number };

export const AI_RATE_LIMIT: RateLimit = { capacity: 10, refillPerMinute: 6 };

export function takeToken(key: string, limit: RateLimit = AI_RATE_LIMIT, now = Date.now()): boolean {
  const bucket = buckets.get(key) ?? { tokens: limit.capacity, updatedAt: now };
  const refilled = Math.min(limit.capacity, bucket.tokens + ((now - bucket.updatedAt) / 60_000) * limit.refillPerMinute);
  if (refilled < 1) {
    buckets.set(key, { tokens: refilled, updatedAt: now });
    return false;
  }
  buckets.set(key, { tokens: refilled - 1, updatedAt: now });
  return true;
}
