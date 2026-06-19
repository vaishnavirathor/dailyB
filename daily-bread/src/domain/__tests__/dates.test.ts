import { addDays, dayOfWeek, diffDays, fromDateKey, toDateKey } from '@/domain/dates';

describe('toDateKey', () => {
  it('formats a local date as YYYY-MM-DD with zero padding', () => {
    expect(toDateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(toDateKey(new Date(2026, 11, 25))).toBe('2026-12-25');
  });

  it('uses the local calendar day, not UTC', () => {
    // 11:30 pm local on Jan 5 must remain Jan 5 regardless of timezone.
    expect(toDateKey(new Date(2026, 0, 5, 23, 30))).toBe('2026-01-05');
  });
});

describe('fromDateKey', () => {
  it('round-trips with toDateKey', () => {
    expect(toDateKey(fromDateKey('2026-06-05'))).toBe('2026-06-05');
  });

  it('constructs a local-midnight date', () => {
    const d = fromDateKey('2026-06-05');
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(5);
    expect(d.getDate()).toBe(5);
    expect(d.getHours()).toBe(0);
  });
});

describe('addDays', () => {
  it('adds within a month', () => {
    expect(addDays('2026-06-05', 3)).toBe('2026-06-08');
  });

  it('crosses month and year boundaries', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
  });

  it('handles leap-day arithmetic', () => {
    expect(addDays('2024-02-28', 1)).toBe('2024-02-29');
    expect(addDays('2025-02-28', 1)).toBe('2025-03-01');
  });

  it('subtracts with negative deltas', () => {
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
  });
});

describe('diffDays', () => {
  it('returns positive when b is after a', () => {
    expect(diffDays('2026-06-01', '2026-06-05')).toBe(4);
  });

  it('returns negative when b is before a', () => {
    expect(diffDays('2026-06-05', '2026-06-01')).toBe(-4);
  });

  it('spans DST-like long ranges exactly by calendar days', () => {
    expect(diffDays('2026-01-01', '2027-01-01')).toBe(365);
    expect(diffDays('2024-01-01', '2025-01-01')).toBe(366); // leap year
  });
});

describe('dayOfWeek', () => {
  it('knows 2026-06-05 is a Friday', () => {
    expect(dayOfWeek('2026-06-05')).toBe(5);
  });

  it('knows 2026-04-05 is a Sunday (Easter 2026)', () => {
    expect(dayOfWeek('2026-04-05')).toBe(0);
  });
});
