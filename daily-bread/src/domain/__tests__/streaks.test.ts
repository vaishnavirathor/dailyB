import { bestStreak, computeStreak } from '@/domain/streaks';

const TODAY = '2026-06-05';

function completed(...keys: string[]): ReadonlySet<string> {
  return new Set(keys);
}

describe('computeStreak', () => {
  it('returns 0 for no activity', () => {
    expect(computeStreak(completed(), TODAY)).toEqual({ length: 0, graceDays: [] });
  });

  it('counts a single completed today', () => {
    expect(computeStreak(completed('2026-06-05'), TODAY)).toEqual({ length: 1, graceDays: [] });
  });

  it('anchors on yesterday when today is still unread', () => {
    const result = computeStreak(completed('2026-06-04', '2026-06-03'), TODAY);
    expect(result.length).toBe(2);
    expect(result.graceDays).toEqual([]);
  });

  it('returns 0 when both today and yesterday are missed', () => {
    expect(computeStreak(completed('2026-06-03', '2026-06-02'), TODAY).length).toBe(0);
  });

  it('counts consecutive completed days', () => {
    const result = computeStreak(
      completed('2026-06-05', '2026-06-04', '2026-06-03', '2026-06-02', '2026-06-01'),
      TODAY,
    );
    expect(result).toEqual({ length: 5, graceDays: [] });
  });

  it('bridges a single missed day with grace', () => {
    // Missed June 4; June 3 and 2 completed → bridge, streak spans 4 days.
    const result = computeStreak(completed('2026-06-05', '2026-06-03', '2026-06-02'), TODAY);
    expect(result.length).toBe(4);
    expect(result.graceDays).toEqual(['2026-06-04']);
  });

  it('"easy repair": completing today restores a streak after missing yesterday', () => {
    const before = computeStreak(completed('2026-06-03', '2026-06-02'), TODAY);
    expect(before.length).toBe(0);
    const after = computeStreak(completed('2026-06-05', '2026-06-03', '2026-06-02'), TODAY);
    expect(after.length).toBe(4);
  });

  it('ends the streak at a 2-day gap', () => {
    const result = computeStreak(completed('2026-06-05', '2026-06-04', '2026-06-01'), TODAY);
    expect(result).toEqual({ length: 2, graceDays: [] });
  });

  it('refuses a second grace bridge within a rolling 7 days', () => {
    // Gaps at June 4 and June 2 — only the first bridges.
    const result = computeStreak(completed('2026-06-05', '2026-06-03', '2026-06-01'), TODAY);
    expect(result.length).toBe(3); // Jun 5 + bridged Jun 4 + Jun 3
    expect(result.graceDays).toEqual(['2026-06-04']);
  });

  it('allows two grace bridges more than 7 days apart', () => {
    // Gap at Jun 4 (grace) … 8 completed days … gap at May 26 (second grace).
    const days = [
      '2026-06-05',
      // Jun 4 missed
      '2026-06-03', '2026-06-02', '2026-06-01', '2026-05-31', '2026-05-30',
      '2026-05-29', '2026-05-28', '2026-05-27',
      // May 26 missed
      '2026-05-25', '2026-05-24',
    ];
    const result = computeStreak(completed(...days), TODAY);
    expect(result.length).toBe(13);
    expect(result.graceDays).toEqual(['2026-06-04', '2026-05-26']);
  });

  it('never bridges two consecutive missed days', () => {
    const result = computeStreak(completed('2026-06-05', '2026-06-02', '2026-06-01'), TODAY);
    expect(result).toEqual({ length: 1, graceDays: [] });
  });
});

describe('bestStreak', () => {
  it('is 0 with no activity', () => {
    expect(bestStreak(completed())).toBe(0);
  });

  it('finds the longest historical run, not just the current one', () => {
    const days = completed(
      // old 4-day run
      '2026-01-01', '2026-01-02', '2026-01-03', '2026-01-04',
      // separate 2-day run
      '2026-03-10', '2026-03-11',
      // current single day
      '2026-06-05',
    );
    expect(bestStreak(days)).toBe(4);
  });

  it('spans month boundaries', () => {
    expect(bestStreak(completed('2026-01-31', '2026-02-01', '2026-02-02'))).toBe(3);
  });
});
