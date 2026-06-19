import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

/**
 * Single SQLite database for all structured data, opened with the ASYNC
 * API — required for web (the sync worker channel times out there) and
 * kinder to the UI thread on native. Migrations run once at startup,
 * versioned via PRAGMA user_version — append new blocks, never edit
 * shipped ones.
 */
const MIGRATIONS: string[] = [
  // v1 — initial schema
  `
  CREATE TABLE IF NOT EXISTS journal_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entry_date TEXT NOT NULL,
    body TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS activity (
    entry_date TEXT PRIMARY KEY,
    verse_seen INTEGER NOT NULL DEFAULT 0,
    reflection_read INTEGER NOT NULL DEFAULT 0,
    prayed INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS plan_progress (
    plan_id TEXT NOT NULL,
    day_index INTEGER NOT NULL,
    completed_at TEXT NOT NULL,
    PRIMARY KEY (plan_id, day_index)
  );
  CREATE INDEX IF NOT EXISTS idx_journal_created ON journal_entries (created_at DESC);
  `,
  // v2 — Bible reader marks + favorites
  `
  CREATE TABLE IF NOT EXISTS bookmarks (
    book_id TEXT NOT NULL,
    chapter INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    PRIMARY KEY (book_id, chapter)
  );
  CREATE TABLE IF NOT EXISTS highlights (
    book_id TEXT NOT NULL,
    chapter INTEGER NOT NULL,
    verse INTEGER NOT NULL,
    color TEXT NOT NULL CHECK (color IN ('sage', 'gold')),
    created_at TEXT NOT NULL,
    PRIMARY KEY (book_id, chapter, verse)
  );
  CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kind TEXT NOT NULL CHECK (kind IN ('verse', 'promise', 'hymn', 'bible')),
    ref_id TEXT NOT NULL,
    payload TEXT NOT NULL,
    created_at TEXT NOT NULL,
    UNIQUE (kind, ref_id)
  );
  `,
  // v3 — Bible marks become version-scoped (te-ov | en-kjv). SQLite can't
  // alter a PK, so rebuild the tables and migrate existing rows as te-ov.
  `
  CREATE TABLE bookmarks_v3 (
    version TEXT NOT NULL DEFAULT 'te-ov',
    book_id TEXT NOT NULL,
    chapter INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    PRIMARY KEY (version, book_id, chapter)
  );
  INSERT INTO bookmarks_v3 (version, book_id, chapter, created_at)
    SELECT 'te-ov', book_id, chapter, created_at FROM bookmarks;
  DROP TABLE bookmarks;
  ALTER TABLE bookmarks_v3 RENAME TO bookmarks;

  CREATE TABLE highlights_v3 (
    version TEXT NOT NULL DEFAULT 'te-ov',
    book_id TEXT NOT NULL,
    chapter INTEGER NOT NULL,
    verse INTEGER NOT NULL,
    color TEXT NOT NULL CHECK (color IN ('sage', 'gold')),
    created_at TEXT NOT NULL,
    PRIMARY KEY (version, book_id, chapter, verse)
  );
  INSERT INTO highlights_v3 (version, book_id, chapter, verse, color, created_at)
    SELECT 'te-ov', book_id, chapter, verse, color, created_at FROM highlights;
  DROP TABLE highlights;
  ALTER TABLE highlights_v3 RENAME TO highlights;
  `,
];

let databasePromise: Promise<SQLiteDatabase> | null = null;

export function getDb(): Promise<SQLiteDatabase> {
  if (databasePromise === null) {
    databasePromise = open();
  }
  return databasePromise;
}

async function open(): Promise<SQLiteDatabase> {
  try {
    return await openAndMigrate('daily-bread.db');
  } catch (error) {
    if (process.env.EXPO_OS === 'web') {
      // Web OPFS can be held by a stale tab/worker ("Unknown" /
      // NoModificationAllowedError / sync timeout). Degrade to an
      // in-memory database so the session still works — persistence
      // returns on the next clean load.
      console.warn('[db] web sqlite unavailable — falling back to in-memory store', error);
      return openAndMigrate(':memory:');
    }
    throw error;
  }
}

async function openAndMigrate(name: string): Promise<SQLiteDatabase> {
  const db = await openDatabaseAsync(name);
  if (process.env.EXPO_OS !== 'web') {
    await db.execAsync('PRAGMA journal_mode = WAL;');
  }
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const current = row?.user_version ?? 0;
  for (let v = current; v < MIGRATIONS.length; v++) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(MIGRATIONS[v]);
      await db.execAsync(`PRAGMA user_version = ${v + 1}`);
    });
  }
  return db;
}
