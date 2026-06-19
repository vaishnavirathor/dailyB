import { days } from '@/content/bundled/days';
import {
  catholicMovableSpecs,
  catholicSeasonNames,
  commonMovableSpecs,
  easternMovableSpecs,
  easternSeasonNames,
  fixedFeastsByTradition,
  type MovableFeastSpec,
} from '@/content/bundled/feasts';
import { hymns as builtinHymns } from '@/content/bundled/hymns';
import scrapedHymns from '@/content/bundled/scraped-hymns.json';
import { plans } from '@/content/bundled/plans';
import { products } from '@/content/bundled/products';
import { promises } from '@/content/bundled/promises';
import type {
  ContentRepository,
  DailyPromise,
  FeastOccurrence,
  Hymn,
  Product,
  ReadingPlan,
  Reflection,
  SeasonBanner,
  Tradition,
  Verse,
} from '@/content/types';
import { movableFeasts } from '@/domain/computus';
import { selectIndex } from '@/domain/daily-selection';
import { addDays, type DateKey } from '@/domain/dates';
import {
  catholicMovables,
  catholicSeason,
  catholicSeasonTints,
  easternSeason,
  easternSeasonTints,
} from '@/domain/liturgical';

/**
 * Promise rotation runs on its own salt so the promise never tracks the
 * verse rotation — the two cards must stay distinct (design rule).
 */
const PROMISE_SALT = 7;

export class BundledContentRepository implements ContentRepository {
  verseFor(date: DateKey): Verse {
    return days[selectIndex(date, days.length)].verse;
  }

  reflectionFor(date: DateKey): Reflection {
    return days[selectIndex(date, days.length)].reflection;
  }

  promiseFor(date: DateKey): DailyPromise {
    return promises[selectIndex(date, promises.length, PROMISE_SALT)];
  }

  plans(): ReadingPlan[] {
    return plans;
  }

  plan(id: string): ReadingPlan | undefined {
    return plans.find((p) => p.id === id);
  }

  feastsForYear(year: number, tradition: Tradition): FeastOccurrence[] {
    const occurrences: FeastOccurrence[] = fixedFeastsByTradition[tradition].map((f) => ({
      id: f.id,
      date: `${year}-${String(f.month).padStart(2, '0')}-${String(f.day).padStart(2, '0')}`,
      name: f.name,
      accent: f.accent,
      readings: f.readings,
    }));

    const common = movableFeasts(year);
    const withDate = (spec: MovableFeastSpec, date: DateKey): FeastOccurrence => ({
      id: spec.id,
      date,
      name: spec.name,
      accent: spec.accent,
      readings: spec.readings,
    });

    for (const id of ['palmSunday', 'goodFriday', 'easter', 'pentecost'] as const) {
      occurrences.push(withDate(commonMovableSpecs[id], common[id]));
    }

    if (tradition === 'catholic') {
      const movables = catholicMovables(year);
      for (const spec of catholicMovableSpecs) {
        occurrences.push(withDate(spec, movables[spec.id as keyof typeof movables]));
      }
    }

    if (tradition === 'orthodox') {
      const dates: Record<string, DateKey> = {
        peturta: addDays(common.easter, -49),
        pesaha: addDays(common.easter, -3),
        ascension: addDays(common.easter, 39),
      };
      for (const spec of easternMovableSpecs) {
        occurrences.push(withDate(spec, dates[spec.id]));
      }
    }

    return occurrences.sort((a, b) => a.date.localeCompare(b.date));
  }

  seasonFor(date: DateKey, tradition: Tradition): SeasonBanner | null {
    if (tradition === 'catholic') {
      const id = catholicSeason(date);
      return { id, name: catholicSeasonNames[id], tint: catholicSeasonTints[id] };
    }
    if (tradition === 'orthodox') {
      const id = easternSeason(date);
      return { id, name: easternSeasonNames[id], tint: easternSeasonTints[id] };
    }
    return null; // Protestant layer is deliberately spare — no season banner
  }

  hymns(): Hymn[] {
    return [...builtinHymns, ...(scrapedHymns as Hymn[])];
  }

  hymn(id: string): Hymn | undefined {
    return builtinHymns.find((h) => h.id === id) ?? (scrapedHymns as Hymn[]).find((h) => h.id === id);
  }

  products(): Product[] {
    return products;
  }

  product(id: string): Product | undefined {
    return products.find((p) => p.id === id);
  }
}

let repository: ContentRepository | null = null;

/** The app-wide content seam — swap the implementation here for a server. */
export function getContentRepository(): ContentRepository {
  if (repository === null) {
    repository = new BundledContentRepository();
  }
  return repository;
}
