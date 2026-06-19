import { getDb } from '@/data/db';

/**
 * Favorites — hearted verses, promises, hymns and Bible verses. The
 * payload snapshot is what the Favorites screen renders and shares, so
 * entries survive content rotation changes.
 */
export type FavoriteKind = 'verse' | 'promise' | 'hymn' | 'bible';

export interface FavoritePayload {
  text: string;
  reference: string;
}

export interface Favorite {
  id: number;
  kind: FavoriteKind;
  refId: string;
  payload: FavoritePayload;
  createdAt: string;
}

export async function toggleFavorite(
  kind: FavoriteKind,
  refId: string,
  payload: FavoritePayload,
): Promise<boolean> {
  const db = await getDb();
  const existing = await db.getFirstAsync('SELECT 1 FROM favorites WHERE kind = ? AND ref_id = ?', [
    kind,
    refId,
  ]);
  if (existing) {
    await db.runAsync('DELETE FROM favorites WHERE kind = ? AND ref_id = ?', [kind, refId]);
    return false;
  }
  await db.runAsync(
    'INSERT INTO favorites (kind, ref_id, payload, created_at) VALUES (?, ?, ?, ?)',
    [kind, refId, JSON.stringify(payload), new Date().toISOString()],
  );
  return true;
}

export async function isFavorite(kind: FavoriteKind, refId: string): Promise<boolean> {
  const db = await getDb();
  const row = await db.getFirstAsync('SELECT 1 FROM favorites WHERE kind = ? AND ref_id = ?', [
    kind,
    refId,
  ]);
  return row !== null;
}

export async function listFavorites(): Promise<Favorite[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{
    id: number;
    kind: FavoriteKind;
    ref_id: string;
    payload: string;
    created_at: string;
  }>('SELECT * FROM favorites ORDER BY created_at DESC');
  return rows.map((row) => ({
    id: row.id,
    kind: row.kind,
    refId: row.ref_id,
    payload: JSON.parse(row.payload) as FavoritePayload,
    createdAt: row.created_at,
  }));
}

export async function removeFavorite(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM favorites WHERE id = ?', [id]);
}
