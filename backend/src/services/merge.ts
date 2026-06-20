import { supabase } from '../lib/supabase.js';
import { logger } from '../lib/logger.js';
import { AppError, internal } from '../lib/errors.js';
import { issueToken } from './auth.js';

const CONFLICT_COLS: Record<string, string[]> = {
  reading_progress: ['version', 'book_id', 'chapter'],
  bookmarks: ['version', 'book_id', 'chapter', 'verse_index'],
  favorites: ['version', 'book_id', 'chapter', 'verse_index'],
};

export async function mergeAnonymousToUser(
  anonymousUserId: string,
  email: string,
  password: string,
): Promise<{ userId: string; token: string; verified: boolean }> {
  logger.info('merging anonymous user', { anonymousUserId, email });

  // 1. Create real user
  const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: false,
  });
  if (createError) {
    logger.error('merge: user creation failed', { anonymousUserId, email, err: createError });
    throw new AppError('UPSTREAM_ERROR', createError.message, 502);
  }
  const newUserId = newUser.user?.id;
  if (!newUserId) throw internal('user creation returned empty during merge');

  // 2. Transfer data for each table
  for (const [table, cols] of Object.entries(CONFLICT_COLS)) {
    await transferTable(table, cols, anonymousUserId, newUserId);
  }

  // 3. Transfer profile if exists
  const { data: oldProfile } = await supabase
    .from('profiles')
    .select('display_name, gender')
    .eq('id', anonymousUserId)
    .maybeSingle();
  await supabase.from('profiles').upsert({
    id: newUserId,
    display_name: oldProfile?.display_name ?? '',
    gender: oldProfile?.gender ?? null,
  }).maybeSingle();

  // 5. Clean up anonymous auth user
  await supabase.auth.admin.deleteUser(anonymousUserId).catch((err: Error) => {
    logger.warn('merge: anonymous user cleanup failed', { anonymousUserId, err });
  });

  const token = await issueToken(newUserId);

  logger.info('merge complete', { anonymousUserId, newUserId });
  return { userId: newUserId, token, verified: false };
}

async function transferTable(
  table: string,
  conflictCols: string[],
  fromId: string,
  toId: string,
): Promise<void> {
  // Fetch anonymous rows
  const { data: anonRows, error: fetchError } = await supabase
    .from(table)
    .select('*')
    .eq('user_id', fromId);

  if (fetchError) {
    logger.error(`merge: fetch ${table} failed`, { fromId, err: fetchError });
    return;
  }
  if (!anonRows || anonRows.length === 0) return;

  // Remove rows that conflict with existing authenticated data
  const toDelete: string[] = [];
  for (const row of anonRows) {
    const match: Record<string, unknown> = {};
    for (const col of conflictCols) match[col] = row[col];

    const { data: existing } = await supabase
      .from(table)
      .select('id')
      .eq('user_id', toId)
      .match(match)
      .maybeSingle();

    if (existing) {
      toDelete.push(row.id as string);
    }
  }

  if (toDelete.length > 0) {
    const { error: delError } = await supabase.from(table).delete().in('id', toDelete);
    if (delError) {
      logger.warn(`merge: delete conflicting ${table} rows failed`, { count: toDelete.length, err: delError });
    }
  }

  // Re-assign remaining
  const { error: updateError } = await supabase
    .from(table)
    .update({ user_id: toId })
    .eq('user_id', fromId);

  if (updateError) {
    logger.error(`merge: re-assign ${table} failed`, { fromId, toId, err: updateError });
  }
}
