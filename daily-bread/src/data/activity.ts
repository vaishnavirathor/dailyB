import { getDb } from '@/data/db';
import type { DateKey } from '@/domain/dates';

export interface DayActivity {
  verseSeen: boolean;
  reflectionRead: boolean;
  prayed: boolean;
}

type Flag = 'verse_seen' | 'reflection_read' | 'prayed';

async function markFlag(date: DateKey, flag: Flag): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO activity (entry_date, ${flag}) VALUES (?, 1)
     ON CONFLICT(entry_date) DO UPDATE SET ${flag} = 1`,
    [date],
  );
}

export function markVerseSeen(date: DateKey): Promise<void> {
  return markFlag(date, 'verse_seen');
}

export function markReflectionRead(date: DateKey): Promise<void> {
  return markFlag(date, 'reflection_read');
}

export function markPrayed(date: DateKey): Promise<void> {
  return markFlag(date, 'prayed');
}

export async function getActivity(date: DateKey): Promise<DayActivity> {
  const db = await getDb();
  const row = await db.getFirstAsync<{
    verse_seen: number;
    reflection_read: number;
    prayed: number;
  }>('SELECT verse_seen, reflection_read, prayed FROM activity WHERE entry_date = ?', [date]);
  return {
    verseSeen: !!row?.verse_seen,
    reflectionRead: !!row?.reflection_read,
    prayed: !!row?.prayed,
  };
}

/** All dates with the verse seen — the streak engine's input. */
export async function completedDates(): Promise<Set<DateKey>> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ entry_date: string }>(
    'SELECT entry_date FROM activity WHERE verse_seen = 1',
  );
  return new Set(rows.map((r) => r.entry_date));
}
