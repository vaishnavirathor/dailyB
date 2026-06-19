import { addDays, type DateKey } from '@/domain/dates';

/**
 * Movable-feast computation for the Protestant/Pentecostal calendar layer:
 * Easter by the Anonymous Gregorian algorithm (Meeus/Jones/Butcher), with
 * Palm Sunday, Good Friday and Pentecost derived from it.
 */
export function easterSunday(year: number): DateKey {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export interface MovableFeasts {
  palmSunday: DateKey;
  goodFriday: DateKey;
  easter: DateKey;
  pentecost: DateKey;
}

export function movableFeasts(year: number): MovableFeasts {
  const easter = easterSunday(year);
  return {
    palmSunday: addDays(easter, -7),
    goodFriday: addDays(easter, -2),
    easter,
    pentecost: addDays(easter, 49),
  };
}
