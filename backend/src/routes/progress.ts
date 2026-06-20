import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import * as progressService from '../services/progress.js';
import { requireAuth } from '../middleware/auth.js';

export const progressRoutes = new Hono()
  .use('*', requireAuth)
  .get('/', async (c) => {
    const userId = c.get('userId') as string;
    const data = await progressService.listProgress(userId);
    return c.json(data);
  })
  .post('/mark', zValidator('json', z.object({
    version: z.string().min(1),
    book_id: z.string().min(1),
    chapter: z.number().int().min(0),
  })), async (c) => {
    const userId = c.get('userId') as string;
    const { version, book_id, chapter } = c.req.valid('json');
    const record = await progressService.markChapterRead(userId, version, book_id, chapter);
    return c.json(record, 201);
  })
  .get('/:version/:bookId/:chapter', async (c) => {
    const userId = c.get('userId') as string;
    const { version, bookId, chapter } = c.req.param();
    const record = await progressService.getProgress(userId, version, bookId, Number(chapter));
    return c.json(record);
  })
  .delete('/:id', async (c) => {
    const userId = c.get('userId') as string;
    await progressService.deleteProgress(userId, c.req.param('id'));
    return c.body(null, 204);
  });
