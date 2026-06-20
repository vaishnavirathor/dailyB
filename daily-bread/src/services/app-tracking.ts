import { initTracker, destroyTracker, getDeviceId, track, flush, type TrackEvent } from './tracker';
import { EventName, createEvent, type AppEventEnvelope } from '../../../shared/events';

const API_BASE = 'https://daily-bread-api-202a8cb-fxzeqvpy4a-uc.a.run.app/api/v1';

let _token: string | null = null;
let _userId: string | null = null;

export function setAuthContext(token: string | null, userId: string | null): void {
  _token = token;
  _userId = userId;
}

async function flushToBackend(events: TrackEvent[]): Promise<void> {
  const deviceId = getDeviceId();

  const envelopes: AppEventEnvelope[] = events.map((e) =>
    createEvent(
      e.event_name as Parameters<typeof createEvent>[0],
      e.properties as Record<string, unknown> as never,
      deviceId,
      _userId,
    ),
  );

  const res = await fetch(`${API_BASE}/analytics/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(_token ? { Authorization: `Bearer ${_token}` } : {}),
    },
    body: JSON.stringify({ events: envelopes }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`tracker returned ${res.status}: ${text}`);
  }
}

export function startTracker(): void {
  initTracker(flushToBackend);
}

export function trackScreen(screen: string, previousScreen?: string): void {
  track(EventName.SCREEN_VIEW, { screen, previous_screen: previousScreen });
}

export function trackChapterOpen(version: string, bookId: string, chapter: number, language: string): void {
  track(EventName.CHAPTER_OPEN, { version, book_id: bookId, chapter, language });
}

export function trackChapterComplete(version: string, bookId: string, chapter: number, durationMs?: number): void {
  track(EventName.CHAPTER_COMPLETE, { version, book_id: bookId, chapter, duration_ms: durationMs });
}

export function trackTtsPlay(version: string, bookId: string, chapter: number, provider: string): void {
  track(EventName.TTS_PLAY, { version, book_id: bookId, chapter, provider });
}

export function trackButtonTap(button: string, screen?: string): void {
  track(EventName.BUTTON_TAP, { button, screen });
}

export { destroyTracker, flush, EventName, track, setAuthContext };

