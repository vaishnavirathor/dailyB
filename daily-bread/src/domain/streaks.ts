import { addDays, diffDays, type DateKey } from '@/domain/dates';

/**
 * Gentle streaks — progress-forward, never shame-based.
 *
 * Rules:
 * - A day counts when the verse was seen that day.
 * - The streak anchors on today if completed, else yesterday (an unread
 *   today never breaks the streak in the morning).
 * - Grace: a single missed day flanked by completed days is bridged
 *   automatically, at most once per rolling 7 days (consecutive bridges
 *   must be more than 7 days apart).
 * - A gap of 2+ days ends the streak. "Easy repair": completing today
 *   re-bridges a single missed yesterday via grace.
 */
export interface StreakResult {
  /** Length in calendar days, bridged grace days included. */
  length: number;
  /** Dates that were bridged by grace, newest first. */
  graceDays: DateKey[];
}

/** Longest strictly-consecutive run of completed days, ever. */
export function bestStreak(completed: ReadonlySet<DateKey>): number {
  let best = 0;
  for (const date of completed) {
    if (completed.has(addDays(date, -1))) {
      continue; // not a run start
    }
    let length = 1;
    let cursor = date;
    for (;;) {
      const next = addDays(cursor, 1);
      if (!completed.has(next)) {
        break;
      }
      length += 1;
      cursor = next;
    }
    best = Math.max(best, length);
  }
  return best;
}

export function computeStreak(completed: ReadonlySet<DateKey>, today: DateKey): StreakResult {
  let anchor: DateKey | null = null;
  if (completed.has(today)) {
    anchor = today;
  } else {
    const yesterday = addDays(today, -1);
    if (completed.has(yesterday)) {
      anchor = yesterday;
    }
  }
  if (anchor === null) {
    return { length: 0, graceDays: [] };
  }

  const graceDays: DateKey[] = [];
  let length = 0;
  let cursor = anchor;
  let lastGrace: DateKey | null = null;

  for (;;) {
    if (completed.has(cursor)) {
      length += 1;
      cursor = addDays(cursor, -1);
      continue;
    }
    // Gap. Bridge with grace only if the day beyond it is completed and
    // the previous bridge (if any) is more than 7 days away.
    const beyond = addDays(cursor, -1);
    const farEnough = lastGrace === null || diffDays(cursor, lastGrace) > 7;
    if (completed.has(beyond) && farEnough) {
      graceDays.push(cursor);
      lastGrace = cursor;
      length += 1; // the bridged day keeps the calendar span honest
      cursor = beyond;
      continue;
    }
    break;
  }

  return { length, graceDays };
}
