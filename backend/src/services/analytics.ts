import { createStorageBackend, type StorageBackend } from '../lib/storage.js';
import { logger } from '../lib/logger.js';
import { EVENT_SCHEMA_VERSION, type AppEventEnvelope } from '../../../shared/events.js';

const storage: StorageBackend = createStorageBackend();

/**
 * Write events to GCS object storage as JSON Lines, keyed by user + date.
 * Events include user_id, device_id, event_name, properties, and timestamps
 * for later querying by user or event type.
 */
export async function trackEvents(
  userId: string | null,
  deviceId: string,
  events: AppEventEnvelope[],
): Promise<void> {
  if (events.length === 0) return;

  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const serverTs = now.toISOString();

  const jsonlLines = events.map((e) =>
    JSON.stringify({
      ...e,
      user_id: userId,
      device_id: deviceId,
      server_ts: serverTs,
      schema_version: EVENT_SCHEMA_VERSION,
    }),
  );

  const tenant = userId ?? 'anonymous';
  await storage.appendEvents(tenant, date, jsonlLines).catch((err) => {
    logger.error('analytics gcs write failed', { tenant, count: events.length, err });
  });
}
