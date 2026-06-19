import { easterSunday, movableFeasts } from '@/domain/computus';

describe('easterSunday', () => {
  // Known Gregorian Easter dates (Western), 2024–2031.
  it.each([
    [2024, '2024-03-31'],
    [2025, '2025-04-20'],
    [2026, '2026-04-05'],
    [2027, '2027-03-28'],
    [2028, '2028-04-16'],
    [2029, '2029-04-01'],
    [2030, '2030-04-21'],
    [2031, '2031-04-13'],
  ])('computes Easter %i as %s', (year, expected) => {
    expect(easterSunday(year)).toBe(expected);
  });

  it('handles the late-March edge (2008-03-23)', () => {
    expect(easterSunday(2008)).toBe('2008-03-23');
  });

  it('handles a late-April Easter (2038-04-25)', () => {
    expect(easterSunday(2038)).toBe('2038-04-25');
  });
});

describe('movableFeasts', () => {
  it('derives Palm Sunday, Good Friday and Pentecost from Easter 2026', () => {
    expect(movableFeasts(2026)).toEqual({
      palmSunday: '2026-03-29',
      goodFriday: '2026-04-03',
      easter: '2026-04-05',
      pentecost: '2026-05-24',
    });
  });

  it('derives correctly across a month boundary (Easter 2024-03-31)', () => {
    expect(movableFeasts(2024)).toEqual({
      palmSunday: '2024-03-24',
      goodFriday: '2024-03-29',
      easter: '2024-03-31',
      pentecost: '2024-05-19',
    });
  });
});
