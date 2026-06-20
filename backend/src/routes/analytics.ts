import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import * as analyticsService from '../services/analytics.js';
import { EVENT_SCHEMA_VERSION, type AppEventEnvelope, type EventPayloads, type EventName, EventName as EN } from '../../../shared/events.js';
import type { Variables } from '../lib/types.js';

export const analyticRoutes = new Hono<{ Variables: Variables }>();

// ── Event payload schemas per event name ──────────────────────

const screenViewProps = z.object({ screen: z.string(), previous_screen: z.string().optional() });
const chapterOpenProps = z.object({ version: z.string(), book_id: z.string(), chapter: z.number(), language: z.string() });
const chapterCompleteProps = z.object({ version: z.string(), book_id: z.string(), chapter: z.number(), duration_ms: z.number().optional() });
const verseBookmarkProps = z.object({ version: z.string(), book_id: z.string(), chapter: z.number(), verse_index: z.number() });
const ttsPlayProps = z.object({ version: z.string(), book_id: z.string(), chapter: z.number(), provider: z.string() });
const ttsStopProps = z.object({ version: z.string(), book_id: z.string(), chapter: z.number(), verse_index: z.number().optional(), duration_ms: z.number().optional() });
const ttsCompleteProps = z.object({ version: z.string(), book_id: z.string(), chapter: z.number(), duration_ms: z.number().optional() });
const fontChangeProps = z.object({ scale: z.string(), heading_font: z.string().optional(), body_font: z.string().optional() });
const langChangeProps = z.object({ from: z.string(), to: z.string() });
const traditionChangeProps = z.object({ from: z.string(), to: z.string() });
const searchProps = z.object({ query: z.string(), result_count: z.number().optional() });
const appOpenProps = z.object({ cold_start: z.boolean() });
const noPropsProps = z.object({}).strict();

const payloadSchemas: Record<string, z.ZodTypeAny> = {
  [EN.SCREEN_VIEW]: screenViewProps,
  [EN.CHAPTER_OPEN]: chapterOpenProps,
  [EN.CHAPTER_COMPLETE]: chapterCompleteProps,
  [EN.VERSE_BOOKMARK]: verseBookmarkProps,
  [EN.VERSE_UNBOOKMARK]: verseBookmarkProps,
  [EN.VERSE_FAVORITE]: verseBookmarkProps,
  [EN.VERSE_UNFAVORITE]: verseBookmarkProps,
  [EN.TTS_PLAY]: ttsPlayProps,
  [EN.TTS_STOP]: ttsStopProps,
  [EN.TTS_COMPLETE]: ttsCompleteProps,
  [EN.FONT_CHANGE]: fontChangeProps,
  [EN.LANGUAGE_CHANGE]: langChangeProps,
  [EN.TRADITION_CHANGE]: traditionChangeProps,
  [EN.SEARCH]: searchProps,
  [EN.APP_OPEN]: appOpenProps,
  [EN.APP_BACKGROUND]: z.object({ foreground_duration_ms: z.number().optional() }),
  [EN.SIGN_UP]: noPropsProps,
  [EN.SIGN_IN]: noPropsProps,
  [EN.ANONYMOUS_START]: noPropsProps,
  [EN.ANONYMOUS_MERGE]: noPropsProps,
};

// ── Event envelope schema ──────────────────────────────────────

const envelopeSchema = z.object({
  schema_version: z.literal(EVENT_SCHEMA_VERSION),
  event_name: z.string(),
  properties: z.record(z.unknown()),
  device_id: z.string().min(1),
  user_id: z.string().nullable(),
  client_ts: z.string(),
  server_ts: z.string().optional(),
});

const batchSchema = z.object({
  events: z.array(envelopeSchema).min(1).max(100),
});

analyticRoutes.post('/events', zValidator('json', batchSchema), async (c) => {
  const userId = c.get('userId') as string | null;
  const { events: raw } = c.req.valid('json');

  // Validate each event's properties against its name-specific schema
  const valid: AppEventEnvelope[] = [];
  for (const e of raw) {
    const schema = payloadSchemas[e.event_name];
    if (!schema) {
      // Skip unknown event names — don't reject the whole batch
      continue;
    }
    const parsed = schema.safeParse(e.properties);
    if (!parsed.success) {
      continue;
    }
    valid.push(e as unknown as AppEventEnvelope);
  }

  if (valid.length === 0) {
    return c.json({ error: 'no valid events in batch' }, 400);
  }

  // Fire-and-forget to GCS; await the DB insert
  analyticsService.trackEvents(userId, valid[0]!.device_id, valid).catch((err) => {
    console.error('[analytics] batch insert failed:', err);
  });

  return c.json({ accepted: valid.length }, 202);
});
