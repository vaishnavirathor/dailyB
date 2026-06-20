import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import * as bookmarksService from '../services/bookmarks.js';
import { requireAuth } from '../middleware/auth.js';

export const bookmarkRoutes = new Hono()
  .use('*', requireAuth)
  .get('/', async (c) => {
    const userId = c.get('userId') as string;
    const data = await bookmarksService.listBookmarks(userId);
    return c.json(data);
  })
  .post('/', zValidator('json', z.object({
    version: z.string().min(1),
    book_id: z.string().min(1),
    chapter: z.number().int().min(0),
    verse_index: z.number().int().min(0),
    note: z.string().max(500).optional(),
  })), async (c) => {
    const userId = c.get('userId') as string;
    const { version, book_id, chapter, verse_index, note } = c.req.valid('json');
    const record = await bookmarksService.addBookmark(userId, version, book_id, chapter, verse_index, note);
    return c.json(record, 201);
  })
  .delete('/:id', async (c) => {
    const userId = c.get('userId') as string;
    await bookmarksService.removeBookmark(userId, c.req.param('id'));
    return c.body(null, 204);
  });
