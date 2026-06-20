import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import * as favoritesService from '../services/favorites.js';
import { requireAuth } from '../middleware/auth.js';

export const favoriteRoutes = new Hono()
  .use('*', requireAuth)
  .get('/', async (c) => {
    const userId = c.get('userId') as string;
    const data = await favoritesService.listFavorites(userId);
    return c.json(data);
  })
  .post('/', zValidator('json', z.object({
    version: z.string().min(1),
    book_id: z.string().min(1),
    chapter: z.number().int().min(0),
    verse_index: z.number().int().min(0),
    text: z.string().optional(),
    reference: z.string().optional(),
  })), async (c) => {
    const userId = c.get('userId') as string;
    const { version, book_id, chapter, verse_index, text, reference } = c.req.valid('json');
    const record = await favoritesService.addFavorite(userId, version, book_id, chapter, verse_index, text, reference);
    return c.json(record, 201);
  })
  .delete('/:id', async (c) => {
    const userId = c.get('userId') as string;
    await favoritesService.removeFavorite(userId, c.req.param('id'));
    return c.body(null, 204);
  });
