/** Warm milestone moments at 7 / 30 / 100 days — each celebrated once. */
export const MILESTONES = [7, 30, 100] as const;
export type Milestone = (typeof MILESTONES)[number];

/**
 * The highest uncelebrated milestone the streak has reached, or null.
 * (Highest, so a user returning after offline catch-up celebrates the
 * biggest moment rather than replaying older ones.)
 */
export function reachedMilestone(
  streakLength: number,
  celebrated: readonly number[],
): Milestone | null {
  for (const milestone of [...MILESTONES].reverse()) {
    if (streakLength >= milestone && !celebrated.includes(milestone)) {
      return milestone;
    }
  }
  return null;
}
