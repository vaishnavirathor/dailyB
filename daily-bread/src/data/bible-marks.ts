import type { BibleVersion } from '@/bible/books';
import { getDb } from '@/data/db';

/**
 * Bookmarks (book+chapter) and verse highlights for the Bible reader —
 * scoped per edition (te-ov | en-kjv) since schema v3.
 */

export type HighlightColor = 'sage' | 'gold';

export interface Bookmark {
  version: BibleVersion;
  bookId: string;
  chapter: number; // 0-based chapter index
}

export async function toggleBookmark(
  version: BibleVersion,
  bookId: string,
  chapter: number,
): Promise<boolean> {
  const db = await getDb();
  const existing = await db.getFirstAsync(
    'SELECT 1 FROM bookmarks WHERE version = ? AND book_id = ? AND chapter = ?',
    [version, bookId, chapter],
  );
  if (existing) {
    await db.runAsync('DELETE FROM bookmarks WHERE version = ? AND book_id = ? AND chapter = ?', [
      version,
      bookId,
      chapter,
    ]);
    return false;
  }
  await db.runAsync(
    'INSERT INTO bookmarks (version, book_id, chapter, created_at) VALUES (?, ?, ?, ?)',
    [version, bookId, chapter, new Date().toISOString()],
  );
  return true;
}

export async function isBookmarked(
  version: BibleVersion,
  bookId: string,
  chapter: number,
): Promise<boolean> {
  const db = await getDb();
  const row = await db.getFirstAsync(
    'SELECT 1 FROM bookmarks WHERE version = ? AND book_id = ? AND chapter = ?',
    [version, bookId, chapter],
  );
  return row !== null;
}

export async function listBookmarks(): Promise<Bookmark[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ version: BibleVersion; book_id: string; chapter: number }>(
    'SELECT version, book_id, chapter FROM bookmarks ORDER BY created_at DESC',
  );
  return rows.map((r) => ({ version: r.version, bookId: r.book_id, chapter: r.chapter }));
}

/** Tap cycles: none → sage → gold → none. Returns the new color. */
export async function cycleHighlight(
  version: BibleVersion,
  bookId: string,
  chapter: number,
  verse: number,
): Promise<HighlightColor | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ color: HighlightColor }>(
    'SELECT color FROM highlights WHERE version = ? AND book_id = ? AND chapter = ? AND verse = ?',
    [version, bookId, chapter, verse],
  );
  if (!row) {
    await db.runAsync(
      'INSERT INTO highlights (version, book_id, chapter, verse, color, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [version, bookId, chapter, verse, 'sage', new Date().toISOString()],
    );
    return 'sage';
  }
  if (row.color === 'sage') {
    await db.runAsync(
      'UPDATE highlights SET color = ? WHERE version = ? AND book_id = ? AND chapter = ? AND verse = ?',
      ['gold', version, bookId, chapter, verse],
    );
    return 'gold';
  }
  await db.runAsync(
    'DELETE FROM highlights WHERE version = ? AND book_id = ? AND chapter = ? AND verse = ?',
    [version, bookId, chapter, verse],
  );
  return null;
}

export async function highlightsFor(
  version: BibleVersion,
  bookId: string,
  chapter: number,
): Promise<Map<number, HighlightColor>> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ verse: number; color: HighlightColor }>(
    'SELECT verse, color FROM highlights WHERE version = ? AND book_id = ? AND chapter = ?',
    [version, bookId, chapter],
  );
  return new Map(rows.map((r) => [r.verse, r.color]));
}
