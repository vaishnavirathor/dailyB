import { supabase } from '../lib/supabase.js';
import { logger } from '../lib/logger.js';
import { AppError } from '../lib/errors.js';

export interface BookmarkRecord {
  id: string;
  version: string;
  book_id: string;
  chapter: number;
  verse_index: number;
  note: string | null;
  created_at: string;
}

export async function listBookmarks(userId: string): Promise<BookmarkRecord[]> {
  const { data, error } = await supabase
    .from('bookmarks')
    .select('id, version, book_id, chapter, verse_index, note, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) {
    logger.error('list bookmarks failed', { userId, err: error });
    throw new AppError('UPSTREAM_ERROR', error.message, 502);
  }
  return data ?? [];
}

export async function addBookmark(
  userId: string,
  version: string,
  bookId: string,
  chapter: number,
  verseIndex: number,
  note?: string,
): Promise<BookmarkRecord> {
  const { data, error } = await supabase
    .from('bookmarks')
    .upsert(
      { user_id: userId, version, book_id: bookId, chapter, verse_index: verseIndex, note: note ?? null },
      { onConflict: 'user_id, version, book_id, chapter, verse_index', ignoreDuplicates: false },
    )
    .select('id, version, book_id, chapter, verse_index, note, created_at')
    .single();
  if (error) {
    logger.error('add bookmark failed', { userId, version, bookId, chapter, verseIndex, err: error });
    throw new AppError('UPSTREAM_ERROR', error.message, 502);
  }
  return data;
}

export async function removeBookmark(userId: string, id: string): Promise<void> {
  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) {
    logger.error('remove bookmark failed', { userId, id, err: error });
    throw new AppError('UPSTREAM_ERROR', error.message, 502);
  }
}
