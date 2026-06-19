import type { DateKey } from '@/domain/dates';
import type { SeasonTint } from '@/domain/liturgical';
import type { Lang } from '@/theme';

/** Every piece of user-facing content carries both languages. */
export type Localized = Record<Lang, string>;

/** The denomination layers — chosen at onboarding, switchable in settings. */
export type Tradition = 'protestant' | 'catholic' | 'orthodox';

export interface Verse {
  id: string;
  reference: Localized;
  text: Localized;
}

export type PromiseCategory = 'hope' | 'provision' | 'healing' | 'victory';

export interface DailyPromise {
  id: string;
  category: PromiseCategory;
  reference: Localized;
  text: Localized;
}

export interface Reflection {
  id: string;
  title: Localized;
  /** 60–90 second devotional read unpacking the day's verse. */
  body: Localized;
  /** Short guided prayer that closes the daily loop. */
  prayer: Localized;
}

/** A day entry pairs verse and reflection by construction. */
export interface DayEntry {
  verse: Verse;
  reflection: Reflection;
}

export interface PlanDay {
  reference: Localized;
  text: Localized;
  thought: Localized;
}

export interface ReadingPlan {
  id: string;
  title: Localized;
  description: Localized;
  days: PlanDay[];
}

export interface FixedFeast {
  id: string;
  name: Localized;
  month: number; // 1–12
  day: number;
  /** Gold = India-special/high feasts; navy = structural observances. */
  accent: 'gold' | 'navy';
  /** Scripture reading references for the day, when curated. */
  readings?: Localized;
}

export interface FeastOccurrence {
  id: string;
  date: DateKey;
  name: Localized;
  accent: 'gold' | 'navy';
  readings?: Localized;
}

/** Season banner data for the calendar header. */
export interface SeasonBanner {
  id: string;
  name: Localized;
  tint: SeasonTint;
}

/** Worship lyrics — parallel display: Telugu + transliteration. */
export interface HymnStanza {
  te: string;
  translit: string;
  isRefrain?: boolean;
}

export interface Hymn {
  id: string;
  title: Localized;
  /** 'scripture' = canticle straight from the OV text · 'original' = ours. */
  source: 'scripture' | 'original';
  reference?: Localized; // for scripture canticles
  stanzas: HymnStanza[];
}

/** Faith Storefront — quiet commerce, curated devotional items. */
export type ProductCategory = 'bibles' | 'frames' | 'rosaries' | 'candles' | 'devotional';

export interface Product {
  id: string;
  name: Localized;
  description: Localized;
  category: ProductCategory;
  priceInr: number;
  /** Icon-tile glyph — no product photography in the bundled catalog. */
  emoji: string;
  /**
   * Renders the hard legal callout (Drugs & Magic Remedies Act, 1954) on
   * the product page. REQUIRED for anointing/holy-oil style items, which
   * may be sold only as devotional/cosmetic objects with zero health,
   * healing or supernatural-protection claims.
   */
  complianceNote?: boolean;
}

/**
 * The single seam between the app and its content. Today the
 * implementation is bundled and synchronous; a future server-backed
 * repository implements this same interface (async wrappers live at the
 * call sites' hooks, so the swap stays local).
 */
export interface ContentRepository {
  verseFor(date: DateKey): Verse;
  promiseFor(date: DateKey): DailyPromise;
  reflectionFor(date: DateKey): Reflection;
  plans(): ReadingPlan[];
  plan(id: string): ReadingPlan | undefined;
  feastsForYear(year: number, tradition: Tradition): FeastOccurrence[];
  /** Liturgical season banner; null for the spare Protestant layer. */
  seasonFor(date: DateKey, tradition: Tradition): SeasonBanner | null;
  hymns(): Hymn[];
  hymn(id: string): Hymn | undefined;
  products(): Product[];
  product(id: string): Product | undefined;
}
