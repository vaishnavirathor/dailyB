import { supabase } from '../lib/supabase.js';
import { logger } from '../lib/logger.js';
import { AppError } from '../lib/errors.js';

export interface FavoriteRecord {
  id: string;
  version: string;
  book_id: string;
  chapter: number;
  verse_index: number;
  text: string | null;
  reference: string | null;
  created_at: string;
}

export async function listFavorites(userId: string): Promise<FavoriteRecord[]> {
  const { data, error } = await supabase
    .from('favorites')
    .select('id, version, book_id, chapter, verse_index, text, reference, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) {
    logger.error('list favorites failed', { userId, err: error });
    throw new AppError('UPSTREAM_ERROR', error.message, 502);
  }
  return data ?? [];
}

export async function addFavorite(
  userId: string,
  version: string,
  bookId: string,
  chapter: number,
  verseIndex: number,
  text?: string,
  reference?: string,
): Promise<FavoriteRecord> {
  const { data, error } = await supabase
    .from('favorites')
    .upsert(
      {
        user_id: userId,
        version,
        book_id: bookId,
        chapter,
        verse_index: verseIndex,
        text: text ?? null,
        reference: reference ?? null,
      },
      { onConflict: 'user_id, version, book_id, chapter, verse_index', ignoreDuplicates: false },
    )
    .select('id, version, book_id, chapter, verse_index, text, reference, created_at')
    .single();
  if (error) {
    logger.error('add favorite failed', { userId, version, bookId, chapter, verseIndex, err: error });
    throw new AppError('UPSTREAM_ERROR', error.message, 502);
  }
  return data;
}

export async function removeFavorite(userId: string, id: string): Promise<void> {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) {
    logger.error('remove favorite failed', { userId, id, err: error });
    throw new AppError('UPSTREAM_ERROR', error.message, 502);
  }
}
