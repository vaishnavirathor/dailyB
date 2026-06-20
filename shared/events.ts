/**
 * ============================================================================
 *  SHARED EVENT SCHEMA — SINGLE SOURCE OF TRUTH
 * ============================================================================
 *
 *  This file defines every analytics event in the Daily Bread app.
 *  ─ BOTH ─ the React Native app AND the Hono backend import this file.
 *
 *  ┌─────────────┐     ┌──────────────┐
 *  │  RN app     │     │  Hono API    │
 *  │  tracks     │────▶│  ingests     │
 *  │  events     │     │  + mirrors   │
 *  │  using      │     │  to GCS      │
 *  │  these types│     │  using these │
 *  └──────┬──────┘     └──────┬───────┘
 *         │                   │
 *         ▼                   ▼
 *    shared/events.ts  ← same file
 *
 *  ── WHEN TO UPDATE ────────────────────────────────────────────
 *  • Add a new event name  → append to `EventName` + add payload shape in `EventPayloads`
 *  • Change a payload shape → bump `EVENT_SCHEMA_VERSION`
 *  • Remove an event       → delete from both `EventName` and `EventPayloads`
 *
 *  ── RULES ─────────────────────────────────────────────────────
 *  1. Never have two copies of this file. This one is canonical.
 *  2. The app must `import { EventName, EventPayloads } from '@shared/events'`
 *  3. The backend must `import { EventName, EventPayloads } from '@shared/events'`
 *  4. All `properties` fields must be JSON-serializable primitives
 *     (string, number, boolean, null, or plain objects of those).
 *  5. Every event payload must be flat — no nested arrays of unknown depth.
 *
 *  ── FILE LOCATION ─────────────────────────────────────────────
 *  shared/events.ts  (root of the monorepo)
 * ============================================================================
 */

/** Bump this when you change a payload shape. Keep it at the top. */
export const EVENT_SCHEMA_VERSION = 1;

// ── Event name registry (add new events here) ─────────────────
export const EventName = {
  SCREEN_VIEW: 'screen_view',
  CHAPTER_OPEN: 'chapter_open',
  CHAPTER_COMPLETE: 'chapter_complete',
  VERSE_BOOKMARK: 'verse_bookmark',
  VERSE_UNBOOKMARK: 'verse_unbookmark',
  VERSE_FAVORITE: 'verse_favorite',
  VERSE_UNFAVORITE: 'verse_unfavorite',
  TTS_PLAY: 'tts_play',
  TTS_STOP: 'tts_stop',
  TTS_COMPLETE: 'tts_complete',
  FONT_CHANGE: 'font_change',
  LANGUAGE_CHANGE: 'language_change',
  TRADITION_CHANGE: 'tradition_change',
  SEARCH: 'search',
  APP_OPEN: 'app_open',
  APP_BACKGROUND: 'app_background',
  SIGN_UP: 'sign_up',
  SIGN_IN: 'sign_in',
  SIGN_IN_GOOGLE: 'sign_in_google',
  SIGN_OUT: 'sign_out',
  ANONYMOUS_START: 'anonymous_start',
  ANONYMOUS_MERGE: 'anonymous_merge',
  PROFILE_UPDATE: 'profile_update',
  BUTTON_TAP: 'button_tap',
  NOTIFICATION_NUDGE_TAP: 'notification_nudge_tap',
  NOTIFICATION_NUDGE_DISMISS: 'notification_nudge_dismiss',
  PRAYER_PRESS: 'prayer_press',
  RITUAL_PRESS: 'ritual_press',
  LARGE_TEXT_PRESS: 'large_text_press',
} as const;

export type EventName = (typeof EventName)[keyof typeof EventName];

// ── Event payload shapes ──────────────────────────────────────
export interface EventPayloads {
  [EventName.SCREEN_VIEW]: { screen: string; previous_screen?: string };
  [EventName.CHAPTER_OPEN]: { version: string; book_id: string; chapter: number; language: string };
  [EventName.CHAPTER_COMPLETE]: { version: string; book_id: string; chapter: number; duration_ms?: number };
  [EventName.VERSE_BOOKMARK]: { version: string; book_id: string; chapter: number; verse_index: number };
  [EventName.VERSE_UNBOOKMARK]: { version: string; book_id: string; chapter: number; verse_index: number };
  [EventName.VERSE_FAVORITE]: { version: string; book_id: string; chapter: number; verse_index: number };
  [EventName.VERSE_UNFAVORITE]: { version: string; book_id: string; chapter: number; verse_index: number };
  [EventName.TTS_PLAY]: { version: string; book_id: string; chapter: number; provider: string };
  [EventName.TTS_STOP]: {
    version: string;
    book_id: string;
    chapter: number;
    verse_index?: number;
    duration_ms?: number;
  };
  [EventName.TTS_COMPLETE]: { version: string; book_id: string; chapter: number; duration_ms?: number };
  [EventName.FONT_CHANGE]: { scale: string; heading_font?: string; body_font?: string };
  [EventName.LANGUAGE_CHANGE]: { from: string; to: string };
  [EventName.TRADITION_CHANGE]: { from: string; to: string };
  [EventName.SEARCH]: { query: string; result_count?: number };
  [EventName.APP_OPEN]: { cold_start: boolean };
  [EventName.APP_BACKGROUND]: { foreground_duration_ms?: number };
  [EventName.SIGN_UP]: Record<string, never>;
  [EventName.SIGN_IN]: Record<string, never>;
  [EventName.SIGN_IN_GOOGLE]: Record<string, never>;
  [EventName.SIGN_OUT]: Record<string, never>;
  [EventName.ANONYMOUS_START]: Record<string, never>;
  [EventName.ANONYMOUS_MERGE]: Record<string, never>;
  [EventName.PROFILE_UPDATE]: { display_name?: string; gender?: string };
  [EventName.BUTTON_TAP]: { button: string; screen?: string };
  [EventName.NOTIFICATION_NUDGE_TAP]: Record<string, never>;
  [EventName.NOTIFICATION_NUDGE_DISMISS]: Record<string, never>;
  [EventName.PRAYER_PRESS]: Record<string, never>;
  [EventName.RITUAL_PRESS]: Record<string, never>;
  [EventName.LARGE_TEXT_PRESS]: Record<string, never>;
}

// ── Full event envelope (what gets serialized to JSONL) ───────
export interface AppEventEnvelope<N extends EventName = EventName> {
  schema_version: number;
  event_name: N;
  properties: EventPayloads[N];
  device_id: string;
  /** null when the user is in an anonymous session. */
  user_id: string | null;
  /** ISO‑8601 — set by the app at flush time. */
  client_ts: string;
  /** ISO‑8601 — set by the backend at ingest. */
  server_ts?: string;
}

/** Type‑safe event factory — use in the app when tracking. */
export function createEvent<N extends EventName>(
  eventName: N,
  properties: EventPayloads[N],
  deviceId: string,
  userId: string | null,
): AppEventEnvelope<N> {
  return {
    schema_version: EVENT_SCHEMA_VERSION,
    event_name: eventName,
    properties,
    device_id: deviceId,
    user_id: userId,
    client_ts: new Date().toISOString(),
  };
}