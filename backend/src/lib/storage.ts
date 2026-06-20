/**
 * GCS abstraction — writes event batches as JSON Lines files.
 * Swap this implementation to write to S3, local FS, etc.
 */

import { config } from './config.js';

export interface StorageBackend {
  appendEvents(tenant: string, date: string, lines: string[]): Promise<void>;
}

/**
 * GCS implementation using the native fetch API (no SDK dependency).
 * Files are written to gs://<bucket>/events/<tenant>/dt=<date>/<uuid>.jsonl
 */
function gcsBackend(): StorageBackend {
  const bucket = config.GCS_EVENTS_BUCKET;
  const baseUrl = `https://storage.googleapis.com/storage/v1/b/${bucket}/o`;

  return {
    async appendEvents(tenant: string, date: string, lines: string[]) {
      const content = lines.join('\n') + '\n';
      const name = `events/${tenant}/dt=${date}/${crypto.randomUUID()}.jsonl`;

      const res = await fetch(`${baseUrl}/${encodeURIComponent(name)}?uploadType=media`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
          Authorization: `Bearer ${await gcsAccessToken()}`,
        },
        body: content,
      });

      if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error(`GCS upload failed (${res.status}): ${body}`);
      }
    },
  };
}

/**
 * No-op backend for local dev — logs instead of writing.
 */
function noopBackend(): StorageBackend {
  return {
    async appendEvents(tenant: string, date: string, lines: string[]) {
      console.log(`[storage:noop] ${tenant}/${date} — ${lines.length} events`);
    },
  };
}

let _gcsToken: { token: string; expires: number } | null = null;

async function gcsAccessToken(): Promise<string> {
  if (_gcsToken && Date.now() < _gcsToken.expires - 60_000) {
    return _gcsToken.token;
  }
  // In Cloud Run, metadata server provides the token.
  const res = await fetch(
    'http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token',
    { headers: { 'Metadata-Flavor': 'Google' } },
  );
  if (!res.ok) throw new Error('Failed to fetch GCS access token');
  const data = (await res.json()) as { access_token: string; expires_in: number };
  _gcsToken = { token: data.access_token, expires: Date.now() + data.expires_in * 1000 };
  return _gcsToken.token;
}

export function createStorageBackend(): StorageBackend {
  return config.GCS_EVENTS_BUCKET ? gcsBackend() : noopBackend();
}
