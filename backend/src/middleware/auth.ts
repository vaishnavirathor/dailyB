import { createMiddleware } from 'hono/factory';
import { jwtVerify } from 'jose';
import { config } from '../lib/config.js';
import type { Variables } from '../lib/types.js';

const secret = new TextEncoder().encode(config.APP_JWT_SECRET);

function setUserId(c: { set: (k: string, v: unknown) => void }, id: string | null): void {
  c.set('userId', id);
}

function getToken(c: { req: { header: (n: string) => string | undefined } }): string | null {
  const h = c.req.header('Authorization');
  if (!h?.startsWith('Bearer ')) return null;
  return h.slice(7);
}

export const authMiddleware = createMiddleware<{ Variables: Variables }>(async (c, next) => {
  const token = getToken(c);
  if (!token) {
    setUserId(c, null);
    await next();
    return;
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    setUserId(c, payload.sub ?? null);
  } catch {
    setUserId(c, null);
  }

  await next();
});

export const requireAuth = createMiddleware<{ Variables: Variables }>(async (c, next) => {
  const token = getToken(c);
  if (!token) {
    return c.json({ error: 'unauthorized' }, 401);
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    setUserId(c, payload.sub!);
    await next();
  } catch {
    return c.json({ error: 'unauthorized' }, 401);
  }
});
