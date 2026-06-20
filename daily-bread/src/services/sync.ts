import { api } from './api';

/**
 * Lightweight sync service — pushes local data to the backend when
 * the user is authenticated. All calls are fire-and-forget; the local
 * store is always the source of truth.
 */

export async function syncFavorite(
  userId: string,
  kind: string,
  refId: string,
  payload: { text: string; reference: string },
  added: boolean,
): Promise<void> {
  if (!kind.startsWith('bible:')) return; // only bible verses sync for now
  const parts = kind.split(':');
  if (parts.length < 4) return;
  const [, version, bookId, chapterStr] = parts;
  const chapter = Number(chapterStr);

  try {
    if (added) {
      await api.post('/favorites', {
        version,
        book_id: bookId,
        chapter,
        verse_index: 0,
        text: payload.text,
        reference: payload.reference,
      });
    } else {
      // Need to find the favorite id on the backend — list and match
      const all = await api.get<any[]>('/favorites');
      const match = all.find(
        (f: any) => f.book_id === bookId && f.chapter === chapter && f.reference === payload.reference,
      );
      if (match) {
        await api.delete(`/favorites/${match.id}`);
      }
    }
  } catch {
    // Non-critical — local data is safe.
  }
}
