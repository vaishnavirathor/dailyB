import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import * as contentService from '../services/content.js';
import type { Variables } from '../lib/types.js';

export const contentRoutes = new Hono<{ Variables: Variables }>();

contentRoutes.get('/promises', zValidator('query', z.object({
  gender: z.enum(['male', 'female']).optional(),
  category: z.enum(['hope', 'provision', 'healing', 'victory']).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
  offset: z.coerce.number().int().min(0).optional().default(0),
})), async (c) => {
  const query = c.req.valid('query');
  const result = contentService.getPromises(query);
  return c.json(result);
});

contentRoutes.get('/notification-config', async (c) => {
  const config = contentService.getNotificationConfig();
  return c.json(config);
});
