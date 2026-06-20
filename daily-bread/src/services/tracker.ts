import * as Crypto from 'expo-crypto';
import { type EventName, type EventPayloads } from '../../../shared/events';

export interface TrackEvent {
  event_name: EventName;
  properties: Record<string, unknown>;
  timestamp?: string;
}

type FlushHandler = (events: TrackEvent[]) => Promise<void>;

let buffer: TrackEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let flushHandler: FlushHandler = async () => {};
let _deviceId: string | null = null;

const FLUSH_INTERVAL = 30_000;
const BATCH_MAX = 50;

/**
 * Initialize the tracker. Call once at app startup.
 */
export function initTracker(handler: FlushHandler): void {
  flushHandler = handler;
  if (!_deviceId) {
    _deviceId = Crypto.randomUUID();
  }
  startFlushTimer();
}

export function getDeviceId(): string {
  if (!_deviceId) {
    _deviceId = Crypto.randomUUID();
  }
  return _deviceId;
}

function startFlushTimer(): void {
  if (flushTimer) clearInterval(flushTimer);
  flushTimer = setInterval(() => {
    void flush();
  }, FLUSH_INTERVAL);
}

/**
 * Track a typed event. The `event` caller guarantees the properties
 * match the event name's schema.
 */
export function track<N extends EventName>(
  eventName: N,
  properties: EventPayloads[N],
): void {
  buffer.push({
    event_name: eventName,
    properties: properties as Record<string, unknown>,
    timestamp: new Date().toISOString(),
  });

  if (buffer.length >= BATCH_MAX) {
    void flush();
  }
}

/**
 * Force-flush buffered events.
 */
export async function flush(): Promise<void> {
  if (buffer.length === 0) return;

  const batch = buffer.splice(0, BATCH_MAX);
  try {
    await flushHandler(batch);
  } catch (err) {
    buffer.unshift(...batch);
    console.warn('[tracker] flush failed, events re-buffered:', err);
  }
}

/**
 * Tear down the tracker.
 */
export function destroyTracker(): void {
  if (flushTimer) {
    clearInterval(flushTimer);
    flushTimer = null;
  }
}
