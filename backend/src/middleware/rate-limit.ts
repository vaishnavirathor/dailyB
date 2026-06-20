import type { Context, Next } from 'hono';
import { logger } from '../lib/logger.js';

interface Entry {
  count: number;
  resetAt: number;
}

const store = new Map<string, Entry>();

const CLEANUP_INTERVAL = 60_000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) store.delete(key);
  }
}

type RateLimitConfig = {
  windowMs: number;
  max: number;
  keyFn?: (c: Context) => string;
};

export function rateLimit(opts: RateLimitConfig) {
  const keyFn = opts.keyFn ?? ((c: Context) => c.req.header('x-forwarded-for') ?? 'unknown');

  return async (c: Context, next: Next) => {
    cleanup();
    const key = keyFn(c);
    const now = Date.now();
    let entry = store.get(key);

    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + opts.windowMs };
      store.set(key, entry);
    }

    entry.count++;
    c.header('X-RateLimit-Limit', String(opts.max));
    c.header('X-RateLimit-Remaining', String(Math.max(0, opts.max - entry.count)));
    c.header('X-RateLimit-Reset', String(Math.ceil(entry.resetAt / 1000)));

    if (entry.count > opts.max) {
      logger.warn('rate limit exceeded', { key, count: entry.count });
      return c.json({ error: 'too many requests, try again later' }, 429);
    }

    await next();
  };
}

export const authRateLimit = rateLimit({
  windowMs: 60_000,
  max: 10,
  keyFn: (c) => {
    const ip = c.req.header('x-forwarded-for') ?? c.req.header('x-real-ip') ?? 'unknown';
    return `auth:${ip}`;
  },
});
