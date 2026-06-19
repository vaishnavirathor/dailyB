import { reachedMilestone } from '@/domain/milestones';

describe('reachedMilestone', () => {
  it('returns null below the first milestone', () => {
    expect(reachedMilestone(6, [])).toBeNull();
  });

  it('fires 7 exactly at a 7-day streak', () => {
    expect(reachedMilestone(7, [])).toBe(7);
  });

  it('does not re-fire a celebrated milestone', () => {
    expect(reachedMilestone(8, [7])).toBeNull();
  });

  it('fires 30 between 30 and 99 when 7 was celebrated', () => {
    expect(reachedMilestone(35, [7])).toBe(30);
  });

  it('returns the highest uncelebrated milestone after a catch-up', () => {
    expect(reachedMilestone(31, [])).toBe(30);
    expect(reachedMilestone(120, [7])).toBe(100);
  });

  it('returns null when everything is celebrated', () => {
    expect(reachedMilestone(365, [7, 30, 100])).toBeNull();
  });

  it('returns null for a zero-length streak', () => {
    expect(reachedMilestone(0, [])).toBeNull();
  });
});
