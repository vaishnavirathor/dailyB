import { supabase } from '../lib/supabase.js';
import { logger } from '../lib/logger.js';
import { AppError, notFound } from '../lib/errors.js';

export interface ProgressRecord {
  id: string;
  version: string;
  book_id: string;
  chapter: number;
  completed_at: string;
}

export async function listProgress(userId: string): Promise<ProgressRecord[]> {
  const { data, error } = await supabase
    .from('reading_progress')
    .select('id, version, book_id, chapter, completed_at')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false });
  if (error) {
    logger.error('list progress failed', { userId, err: error });
    throw new AppError('UPSTREAM_ERROR', error.message, 502);
  }
  return data ?? [];
}

export async function markChapterRead(
  userId: string,
  version: string,
  bookId: string,
  chapter: number,
): Promise<ProgressRecord> {
  const { data, error } = await supabase
    .from('reading_progress')
    .upsert(
      { user_id: userId, version, book_id: bookId, chapter },
      { onConflict: 'user_id, version, book_id, chapter', ignoreDuplicates: false },
    )
    .select('id, version, book_id, chapter, completed_at')
    .single();
  if (error) {
    logger.error('mark chapter failed', { userId, version, bookId, chapter, err: error });
    throw new AppError('UPSTREAM_ERROR', error.message, 502);
  }
  return data;
}

export async function getProgress(
  userId: string,
  version: string,
  bookId: string,
  chapter: number,
): Promise<ProgressRecord | null> {
  const { data, error } = await supabase
    .from('reading_progress')
    .select('id, version, book_id, chapter, completed_at')
    .eq('user_id', userId)
    .eq('version', version)
    .eq('book_id', bookId)
    .eq('chapter', chapter)
    .maybeSingle();
  if (error) {
    logger.error('get progress failed', { userId, version, bookId, chapter, err: error });
    throw new AppError('UPSTREAM_ERROR', error.message, 502);
  }
  return data;
}

export async function deleteProgress(userId: string, id: string): Promise<void> {
  const { error } = await supabase
    .from('reading_progress')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) {
    logger.error('delete progress failed', { userId, id, err: error });
    throw new AppError('UPSTREAM_ERROR', error.message, 502);
  }
}
