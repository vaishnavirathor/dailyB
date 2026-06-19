import type { DateKey } from '@/domain/dates';

/**
 * The curtain shows exactly once per local calendar day — the first
 * fresh open of the day. Pure so the rule is testable.
 */
export function shouldShowCurtain(lastShown: DateKey | null, today: DateKey): boolean {
  return lastShown !== today;
}
