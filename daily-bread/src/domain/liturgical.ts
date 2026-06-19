import { easterSunday, movableFeasts } from '@/domain/computus';
import { addDays, dayOfWeek, type DateKey } from '@/domain/dates';

/**
 * Liturgical engine for the Catholic and Syro-Malabar/Orthodox layers.
 * All movable anchors derive from computus Easter and Christmas.
 *
 * ⚠️ Season boundaries (especially the East Syriac Eliya–Sliba–Muse span)
 * follow the commonly published rules and are flagged for liturgical
 * review before launch.
 */

export type CatholicSeasonId =
  | 'advent'
  | 'christmastide'
  | 'lent'
  | 'holyWeek'
  | 'eastertide'
  | 'ordinary';

export type EasternSeasonId =
  | 'subara' // Annunciation–Nativity
  | 'denha' // Epiphany
  | 'greatFast' // Sawma Rabba
  | 'qyamta' // Resurrection
  | 'slihe' // Apostles
  | 'qaita' // Summer
  | 'eliyaSlibaMuse' // Eliya–Sliba–Muse
  | 'qudasEdta'; // Dedication of the Church

export type SeasonTint = 'navy' | 'gold' | 'sage';

/** First Sunday of Advent — the 4th Sunday before Christmas Day. */
export function adventStart(year: number): DateKey {
  const christmas: DateKey = `${year}-12-25`;
  const dow = dayOfWeek(christmas);
  const sundayBefore = dow === 0 ? 7 : dow; // strictly before Christmas
  return addDays(christmas, -sundayBefore - 21);
}

/** First Sunday strictly after the given date. */
function sundayAfter(date: DateKey): DateKey {
  const dow = dayOfWeek(date);
  return addDays(date, dow === 0 ? 7 : 7 - dow);
}

export interface CatholicMovables {
  ashWednesday: DateKey;
  holyThursday: DateKey;
  ascension: DateKey; // Thursday, Easter + 39
  trinitySunday: DateKey; // Easter + 56
  corpusChristi: DateKey; // Sunday observance (India), Easter + 63
  christTheKing: DateKey; // Sunday before Advent
  adventStart: DateKey;
}

export function catholicMovables(year: number): CatholicMovables {
  const easter = easterSunday(year);
  const advent = adventStart(year);
  return {
    ashWednesday: addDays(easter, -46),
    holyThursday: addDays(easter, -3),
    ascension: addDays(easter, 39),
    trinitySunday: addDays(easter, 56),
    corpusChristi: addDays(easter, 63),
    christTheKing: addDays(advent, -7),
    adventStart: advent,
  };
}

export function catholicSeason(date: DateKey): CatholicSeasonId {
  const year = Number(date.slice(0, 4));

  // Christmastide: Dec 25 → Baptism of the Lord (Sunday after Epiphany).
  if (date >= `${year}-12-25`) {
    return 'christmastide';
  }
  if (date <= sundayAfter(`${year}-01-06`)) {
    return 'christmastide';
  }
  if (date >= adventStart(year)) {
    return 'advent';
  }

  const { palmSunday, easter, pentecost } = movableFeasts(year);
  const ashWednesday = addDays(easter, -46);
  if (date >= ashWednesday && date < palmSunday) {
    return 'lent';
  }
  if (date >= palmSunday && date < easter) {
    return 'holyWeek';
  }
  if (date >= easter && date <= pentecost) {
    return 'eastertide';
  }
  return 'ordinary';
}

export function easternSeason(date: DateKey): EasternSeasonId {
  const year = Number(date.slice(0, 4));

  // The Nativity span of Subara spills past New Year until Epiphany eve.
  if (date < `${year}-01-06`) {
    return 'subara';
  }

  const easter = easterSunday(year);
  const subaraStart = adventStart(year); // same 4th-Sunday rule as Advent
  if (date >= subaraStart) {
    return 'subara';
  }
  if (date >= addDays(subaraStart, -28)) {
    return 'qudasEdta'; // four weeks of Dedication
  }
  if (date >= addDays(easter, 147)) {
    return 'eliyaSlibaMuse';
  }
  if (date >= addDays(easter, 98)) {
    return 'qaita';
  }
  if (date >= addDays(easter, 49)) {
    return 'slihe'; // opens on Pentecost
  }
  if (date >= easter) {
    return 'qyamta';
  }
  if (date >= addDays(easter, -49)) {
    return 'greatFast'; // opens on Peturta Sunday
  }
  return 'denha';
}

/** Design rule: season banners tint only from the existing palette. */
export const catholicSeasonTints: Record<CatholicSeasonId, SeasonTint> = {
  advent: 'navy',
  christmastide: 'gold',
  lent: 'navy',
  holyWeek: 'navy',
  eastertide: 'gold',
  ordinary: 'sage',
};

export const easternSeasonTints: Record<EasternSeasonId, SeasonTint> = {
  subara: 'navy',
  denha: 'gold',
  greatFast: 'navy',
  qyamta: 'gold',
  slihe: 'sage',
  qaita: 'sage',
  eliyaSlibaMuse: 'sage',
  qudasEdta: 'gold',
};
