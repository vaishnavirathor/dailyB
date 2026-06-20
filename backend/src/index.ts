import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { config } from './lib/config.js';
import { logger } from './lib/logger.js';
import { AppError } from './lib/errors.js';
import type { Variables } from './lib/types.js';
import { authMiddleware } from './middleware/auth.js';
import { authRateLimit } from './middleware/rate-limit.js';
import { analyticRoutes } from './routes/analytics.js';
import { authRoutes } from './routes/auth.js';
import { bookmarkRoutes } from './routes/bookmarks.js';
import { contentRoutes } from './routes/content.js';
import { favoriteRoutes } from './routes/favorites.js';
import { preferenceRoutes } from './routes/preferences.js';
import { progressRoutes } from './routes/progress.js';

const app = new Hono<{ Variables: Variables }>();

// Middleware
app.use('*', secureHeaders());
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));
app.use('*', authMiddleware);

// Health check
app.get('/health', (c) => c.json({ status: 'ok' }));

// Public routes
app.use('/api/v1/auth/*', authRateLimit);
app.route('/api/v1/auth', authRoutes);
app.route('/api/v1/analytics', analyticRoutes);
app.route('/api/v1/content', contentRoutes);

// Protected routes (requireAuth applied inside each route group)
app.route('/api/v1/progress', progressRoutes);
app.route('/api/v1/bookmarks', bookmarkRoutes);
app.route('/api/v1/favorites', favoriteRoutes);
app.route('/api/v1/preferences', preferenceRoutes);

// Error handler
app.onError((err, c) => {
  if (err instanceof AppError) {
    logger.warn(err.message, {
      code: err.code,
      status: err.status,
      details: err.details,
      path: c.req.path,
      method: c.req.method,
    });
    return c.json(
      {
        error: err.message,
        code: err.code,
        ...(err.details ? { details: err.details } : {}),
      },
      err.status as 400 | 401 | 403 | 404 | 409 | 500 | 502,
    );
  }

  logger.error('unhandled error', {
    err,
    path: c.req.path,
    method: c.req.method,
  });

  return c.json({ error: 'internal server error' }, 500);
});

app.notFound((c) => c.json({ error: 'not found' }, 404));

serve({ fetch: app.fetch, port: config.PORT }, (info) => {
  logger.info('server started', { port: info.port });
});
