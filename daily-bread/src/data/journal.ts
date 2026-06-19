import { getDb } from '@/data/db';
import type { DateKey } from '@/domain/dates';

export interface JournalEntry {
  id: number;
  entryDate: DateKey;
  body: string;
  createdAt: string; // ISO timestamp
}

interface Row {
  id: number;
  entry_date: string;
  body: string;
  created_at: string;
}

function toEntry(row: Row): JournalEntry {
  return { id: row.id, entryDate: row.entry_date, body: row.body, createdAt: row.created_at };
}

export async function addJournalEntry(entryDate: DateKey, body: string): Promise<JournalEntry> {
  const createdAt = new Date().toISOString();
  const db = await getDb();
  const result = await db.runAsync(
    'INSERT INTO journal_entries (entry_date, body, created_at) VALUES (?, ?, ?)',
    [entryDate, body, createdAt],
  );
  return { id: Number(result.lastInsertRowId), entryDate, body, createdAt };
}

export async function listJournalEntries(): Promise<JournalEntry[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<Row>(
    'SELECT * FROM journal_entries ORDER BY created_at DESC',
  );
  return rows.map(toEntry);
}

export async function getJournalEntry(id: number): Promise<JournalEntry | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<Row>('SELECT * FROM journal_entries WHERE id = ?', [id]);
  return row ? toEntry(row) : null;
}

export async function deleteJournalEntry(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM journal_entries WHERE id = ?', [id]);
}
