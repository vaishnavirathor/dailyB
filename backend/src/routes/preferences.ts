import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import * as preferencesService from '../services/preferences.js';
import { requireAuth } from '../middleware/auth.js';

export const preferenceRoutes = new Hono()
  .use('*', requireAuth)
  .get('/', async (c) => {
    const userId = c.get('userId') as string;
    const prefs = await preferencesService.getPreferences(userId);
    return c.json(prefs);
  })
  .put('/', zValidator('json', z.object({
    language: z.string().optional(),
    tradition: z.string().optional(),
    font_scale: z.string().optional(),
    tts_gender: z.string().optional(),
    telugu_heading_font: z.string().optional(),
    telugu_body_font: z.string().optional(),
    english_heading_font: z.string().optional(),
    english_body_font: z.string().optional(),
  })), async (c) => {
    const userId = c.get('userId') as string;
    const body = c.req.valid('json');
    const prefs = await preferencesService.upsertPreferences(userId, body);
    return c.json(prefs);
  });
