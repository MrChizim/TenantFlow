const buckets = new Map<string, number[]>();

/** Simple in-memory sliding-window rate limiter. Resets on server restart; not shared across instances. */
export function isRateLimited(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const timestamps = (buckets.get(key) ?? []).filter(t => now - t < windowMs);
  if (timestamps.length >= maxRequests) {
    buckets.set(key, timestamps);
    return true;
  }
  timestamps.push(now);
  buckets.set(key, timestamps);
  return false;
}
