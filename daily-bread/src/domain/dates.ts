/**
 * Local-date utilities. The app's unit of time is the device-local calendar
 * day, encoded as a 'YYYY-MM-DD' DateKey — never UTC timestamps, so a verse
 * read at 11pm IST belongs to that day.
 */
export type DateKey = string;

export function toDateKey(date: Date): DateKey {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function fromDateKey(key: DateKey): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(key: DateKey, days: number): DateKey {
  const date = fromDateKey(key);
  date.setDate(date.getDate() + days);
  return toDateKey(date);
}

/** Calendar-day difference b − a (positive when b is after a). */
export function diffDays(a: DateKey, b: DateKey): number {
  const MS_PER_DAY = 86_400_000;
  // Round, not truncate: DST shifts make some local days ±1h long.
  return Math.round((fromDateKey(b).getTime() - fromDateKey(a).getTime()) / MS_PER_DAY);
}

/** 0 = Sunday … 6 = Saturday. */
export function dayOfWeek(key: DateKey): number {
  return fromDateKey(key).getDay();
}
