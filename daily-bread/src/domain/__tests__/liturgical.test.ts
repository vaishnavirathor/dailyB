import {
  adventStart,
  catholicMovables,
  catholicSeason,
  easternSeason,
} from '@/domain/liturgical';

describe('adventStart', () => {
  it.each([
    [2022, '2022-11-27'], // Christmas on Sunday → earliest start
    [2023, '2023-12-03'], // Christmas on Monday → latest start
    [2026, '2026-11-29'],
    [2027, '2027-11-28'],
  ])('computes Advent 1 of %i as %s', (year, expected) => {
    expect(adventStart(year)).toBe(expected);
  });
});

describe('catholicMovables', () => {
  it('derives the 2026 movable feasts from Easter 2026-04-05', () => {
    expect(catholicMovables(2026)).toEqual({
      ashWednesday: '2026-02-18',
      holyThursday: '2026-04-02',
      ascension: '2026-05-14',
      trinitySunday: '2026-05-31',
      corpusChristi: '2026-06-07',
      christTheKing: '2026-11-22',
      adventStart: '2026-11-29',
    });
  });

  it('computes Ash Wednesday across years', () => {
    expect(catholicMovables(2024).ashWednesday).toBe('2024-02-14');
    expect(catholicMovables(2025).ashWednesday).toBe('2025-03-05');
  });
});

describe('catholicSeason', () => {
  it.each([
    ['2026-12-01', 'advent'],
    ['2026-11-29', 'advent'], // Advent 1 itself
    ['2026-12-24', 'advent'],
    ['2026-12-25', 'christmastide'],
    ['2027-01-03', 'christmastide'], // before Baptism of the Lord
    ['2026-01-10', 'christmastide'], // Epiphany week, Baptism = Jan 11 2026
    ['2026-01-15', 'ordinary'], // after Baptism of the Lord
    ['2026-02-18', 'lent'], // Ash Wednesday
    ['2026-03-28', 'lent'], // day before Palm Sunday
    ['2026-03-29', 'holyWeek'], // Palm Sunday
    ['2026-04-04', 'holyWeek'], // Holy Saturday
    ['2026-04-05', 'eastertide'], // Easter
    ['2026-05-24', 'eastertide'], // Pentecost closes Eastertide
    ['2026-05-25', 'ordinary'],
    ['2026-08-15', 'ordinary'],
  ])('classifies %s as %s', (date, season) => {
    expect(catholicSeason(date)).toBe(season);
  });
});

describe('easternSeason', () => {
  it.each([
    ['2026-12-01', 'subara'],
    ['2026-01-03', 'subara'], // Nativity span runs to Epiphany eve
    ['2026-01-20', 'denha'],
    ['2026-02-15', 'greatFast'], // Peturta Sunday = Easter − 49
    ['2026-04-03', 'greatFast'], // Good Friday inside the Great Fast span
    ['2026-04-05', 'qyamta'], // Easter
    ['2026-05-23', 'qyamta'], // eve of Pentecost
    ['2026-05-24', 'slihe'], // Pentecost opens Apostles
    ['2026-07-15', 'qaita'],
    ['2026-10-20', 'eliyaSlibaMuse'],
    ['2026-11-15', 'qudasEdta'], // four weeks before Subara
    ['2026-11-28', 'qudasEdta'],
    ['2026-11-29', 'subara'],
  ])('classifies %s as %s', (date, season) => {
    expect(easternSeason(date)).toBe(season);
  });

  it('covers every day of 2026 with exactly one season', () => {
    let date = '2026-01-01';
    for (let i = 0; i < 365; i++) {
      expect(easternSeason(date)).toBeTruthy();
      date = nextDay(date);
    }
  });
});

function nextDay(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(y, m - 1, d + 1);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${mm}-${dd}`;
}
