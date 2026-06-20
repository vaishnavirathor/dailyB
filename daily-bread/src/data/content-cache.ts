import { getDb } from '@/data/db';

export interface CachedPromise {
  id: string;
  category: 'hope' | 'provision' | 'healing' | 'victory';
  referenceEn: string;
  referenceTe: string;
  textEn: string;
  textTe: string;
  gender: 'general' | 'male' | 'female';
  fetchedAt: string;
}

export interface CascadeSlot {
  id: string;
  type: 'prayer_reminder' | 'streak_check';
  label: string;
  title: string;
  body: string;
}

export interface NotificationConfig {
  version: number;
  base_slot_label: string;
  cascade_hours: number[];
  cascade: CascadeSlot[];
}

let migrated = false;
async function ensureTable(): Promise<void> {
  if (migrated) return;
  const db = await getDb();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS cached_promises (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      reference_en TEXT NOT NULL,
      reference_te TEXT NOT NULL,
      text_en TEXT NOT NULL,
      text_te TEXT NOT NULL,
      gender TEXT NOT NULL DEFAULT 'general',
      fetched_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS notification_config (
      id INTEGER PRIMARY KEY DEFAULT 1,
      json TEXT NOT NULL,
      fetched_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS content_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
  migrated = true;
}

export async function cachePromises(promises: {
  id: string; category: string; referenceEn: string; referenceTe: string;
  textEn: string; textTe: string; gender: string;
}[]): Promise<void> {
  await ensureTable();
  const db = await getDb();
  const now = new Date().toISOString();
  await db.withTransactionAsync(async () => {
    for (const p of promises) {
      await db.runAsync(
        `INSERT OR REPLACE INTO cached_promises
         (id, category, reference_en, reference_te, text_en, text_te, gender, fetched_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [p.id, p.category, p.referenceEn, p.referenceTe, p.textEn, p.textTe, p.gender, now],
      );
    }
  });
}

export async function countCachedPromises(): Promise<number> {
  await ensureTable();
  const db = await getDb();
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM cached_promises',
  );
  return row?.count ?? 0;
}

export async function getAllCachedPromises(): Promise<CachedPromise[]> {
  await ensureTable();
  const db = await getDb();
  const rows = await db.getAllAsync<CachedPromise>(
    `SELECT id, category,
            reference_en as referenceEn, reference_te as referenceTe,
            text_en as textEn, text_te as textTe,
            gender, fetched_at as fetchedAt
     FROM cached_promises
     ORDER BY fetched_at DESC`,
  );
  return rows;
}

export async function getCachedPromiseById(id: string): Promise<CachedPromise | null> {
  await ensureTable();
  const db = await getDb();
  const row = await db.getFirstAsync<CachedPromise>(
    `SELECT id, category,
            reference_en as referenceEn, reference_te as referenceTe,
            text_en as textEn, text_te as textTe,
            gender, fetched_at as fetchedAt
     FROM cached_promises WHERE id = ?`,
    [id],
  );
  return row ?? null;
}

export async function cacheNotificationConfig(config: NotificationConfig): Promise<void> {
  await ensureTable();
  const db = await getDb();
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT OR REPLACE INTO notification_config (id, json, fetched_at) VALUES (1, ?, ?)`,
    [JSON.stringify(config), now],
  );
}

export async function getCachedNotificationConfig(): Promise<NotificationConfig | null> {
  await ensureTable();
  const db = await getDb();
  const row = await db.getFirstAsync<{ json: string; fetched_at: string }>(
    'SELECT json, fetched_at FROM notification_config WHERE id = 1',
  );
  if (!row) return null;
  return JSON.parse(row.json) as NotificationConfig;
}

export async function setMeta(key: string, value: string): Promise<void> {
  await ensureTable();
  const db = await getDb();
  await db.runAsync(
    'INSERT OR REPLACE INTO content_meta (key, value) VALUES (?, ?)',
    [key, value],
  );
}

export async function getMeta(key: string): Promise<string | null> {
  await ensureTable();
  const db = await getDb();
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM content_meta WHERE key = ?',
    [key],
  );
  return row?.value ?? null;
}
