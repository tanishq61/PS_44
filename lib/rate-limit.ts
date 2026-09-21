// Basic in-memory rate limiter for a single node instance
// Note: In a real distributed production environment, use Upstash Redis instead.

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitRecord>();

export async function rateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60000 // 1 minute default
): Promise<{ success: boolean }> {
  const now = Date.now();
  const record = store.get(identifier);

  if (!record || record.resetTime < now) {
    // New record or expired window
    store.set(identifier, { count: 1, resetTime: now + windowMs });
    return { success: true };
  }

  if (record.count >= limit) {
    // Rate limit exceeded
    return { success: false };
  }

  // Increment count
  record.count += 1;
  store.set(identifier, record);
  return { success: true };
}
