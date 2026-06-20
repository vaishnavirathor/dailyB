import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import * as authService from '../services/auth.js';
import { mergeAnonymousToUser } from '../services/merge.js';
import type { Variables } from '../lib/types.js';

const genderEnum = z.enum(['male', 'female', 'nonbinary', 'undisclosed']).optional();

export const authRoutes = new Hono<{ Variables: Variables }>();

authRoutes.post('/sign-up', zValidator('json', z.object({
  email: z.string().email(),
  password: z.string().min(6),
  display_name: z.string().min(1).max(60).optional(),
  gender: genderEnum,
})), async (c) => {
  const { email, password, display_name, gender } = c.req.valid('json');
  const result = await authService.signUp(email, password, display_name, gender);
  return c.json(result, 201);
});

authRoutes.post('/sign-in', zValidator('json', z.object({
  email: z.string().email(),
  password: z.string().min(1),
})), async (c) => {
  const { email, password } = c.req.valid('json');
  const result = await authService.signIn(email, password);
  return c.json(result);
});

authRoutes.post('/sign-in/anonymous', async (c) => {
  const result = await authService.signInAnonymously();
  return c.json(result);
});

authRoutes.post('/google', zValidator('json', z.object({
  access_token: z.string().min(1),
})), async (c) => {
  const { access_token } = c.req.valid('json');
  const result = await authService.signInWithGoogle(access_token);
  return c.json(result);
});

authRoutes.post('/merge', zValidator('json', z.object({
  anonymous_user_id: z.string().uuid(),
  email: z.string().email(),
  password: z.string().min(6),
})), async (c) => {
  const { anonymous_user_id, email, password } = c.req.valid('json');
  const result = await mergeAnonymousToUser(anonymous_user_id, email, password);
  return c.json(result);
});

authRoutes.get('/verify-email', async (c) => {
  const userId = c.get('userId') as string;
  if (!userId) return c.json({ error: 'unauthorized' }, 401);
  const verified = await authService.checkEmailVerified(userId);
  return c.json({ verified });
});

authRoutes.post('/resend-verification', zValidator('json', z.object({
  email: z.string().email(),
})), async (c) => {
  const { email } = c.req.valid('json');
  await authService.resendVerification(email);
  return c.json({ ok: true });
});

authRoutes.get('/profile', async (c) => {
  const userId = c.get('userId') as string;
  if (!userId) return c.json({ error: 'unauthorized' }, 401);
  const profile = await authService.getProfile(userId);
  return c.json(profile);
});

authRoutes.patch('/profile', zValidator('json', z.object({
  display_name: z.string().min(1).max(60).optional(),
  gender: genderEnum,
})), async (c) => {
  const userId = c.get('userId') as string;
  if (!userId) return c.json({ error: 'unauthorized' }, 401);
  const data = c.req.valid('json');
  const profile = await authService.updateProfile(userId, data);
  return c.json(profile);
});
