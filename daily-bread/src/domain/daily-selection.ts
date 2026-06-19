import { diffDays, type DateKey } from '@/domain/dates';

/** Fixed reference date for the rotation — never change once shipped. */
const EPOCH: DateKey = '2026-01-01';

/**
 * Deterministic date → content-index mapping: everyone sees the same verse
 * on the same day, fully offline. Each collection passes its own salt so
 * the verse, promise and reflection rotations don't move in lockstep.
 */
export function selectIndex(date: DateKey, collectionLength: number, salt = 0): number {
  if (collectionLength <= 0) {
    return 0;
  }
  const days = diffDays(EPOCH, date);
  return (((days + salt) % collectionLength) + collectionLength) % collectionLength;
}
