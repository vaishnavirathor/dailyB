import { BundledContentRepository } from '@/content/bundled';
import { days } from '@/content/bundled/days';
import { festivalCards } from '@/content/bundled/festivals';
import { hymns } from '@/content/bundled/hymns';
import { plans } from '@/content/bundled/plans';
import { products } from '@/content/bundled/products';
import { promises } from '@/content/bundled/promises';
import type { Localized } from '@/content/types';
import { addDays } from '@/domain/dates';

const repo = new BundledContentRepository();

function expectLocalized(value: Localized, label: string) {
  expect(value.en?.trim().length).toBeGreaterThan(0);
  expect(value.te?.trim().length).toBeGreaterThan(0);
  // Telugu text must actually contain Telugu script (U+0C00–U+0C7F).
  expect(value.te).toMatch(/[ఀ-౿]/);
  void label;
}

describe('bundled content integrity', () => {
  it('has non-empty collections', () => {
    expect(days.length).toBeGreaterThanOrEqual(14);
    expect(promises.length).toBeGreaterThanOrEqual(20);
    expect(plans.length).toBeGreaterThanOrEqual(2);
  });

  it('every day entry is fully bilingual', () => {
    for (const { verse, reflection } of days) {
      expectLocalized(verse.reference, verse.id);
      expectLocalized(verse.text, verse.id);
      expectLocalized(reflection.title, reflection.id);
      expectLocalized(reflection.body, reflection.id);
      expectLocalized(reflection.prayer, reflection.id);
    }
  });

  it('every promise is fully bilingual and categorised', () => {
    const categories = new Set<string>();
    for (const promise of promises) {
      expectLocalized(promise.reference, promise.id);
      expectLocalized(promise.text, promise.id);
      categories.add(promise.category);
    }
    expect(categories).toEqual(new Set(['hope', 'provision', 'healing', 'victory']));
  });

  it('has unique ids across days and promises', () => {
    const ids = [
      ...days.map((d) => d.verse.id),
      ...days.map((d) => d.reflection.id),
      ...promises.map((p) => p.id),
    ];
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every plan has exactly 7 bilingual days', () => {
    for (const plan of plans) {
      expectLocalized(plan.title, plan.id);
      expectLocalized(plan.description, plan.id);
      expect(plan.days).toHaveLength(7);
      for (const day of plan.days) {
        expectLocalized(day.reference, plan.id);
        expectLocalized(day.text, plan.id);
        expectLocalized(day.thought, plan.id);
      }
    }
  });
});

describe('repository resolution', () => {
  it('resolves verse, promise and reflection for every day of a full year', () => {
    let date = '2026-01-01';
    for (let i = 0; i < 365; i++) {
      expect(repo.verseFor(date)).toBeDefined();
      expect(repo.promiseFor(date)).toBeDefined();
      expect(repo.reflectionFor(date)).toBeDefined();
      date = addDays(date, 1);
    }
  });

  it('pairs the reflection with its verse on every date', () => {
    let date = '2026-01-01';
    for (let i = 0; i < 30; i++) {
      const verse = repo.verseFor(date);
      const reflection = repo.reflectionFor(date);
      const entry = days.find((d) => d.verse.id === verse.id);
      expect(entry?.reflection.id).toBe(reflection.id);
      date = addDays(date, 1);
    }
  });

  it('keeps verse and promise rotations distinct on the same day', () => {
    // With different salts the promise must not simply mirror the verse index.
    const verseIds = new Set<string>();
    const pairings = new Set<string>();
    let date = '2026-01-01';
    for (let i = 0; i < days.length; i++) {
      pairings.add(`${repo.verseFor(date).id}:${repo.promiseFor(date).id}`);
      verseIds.add(repo.verseFor(date).id);
      date = addDays(date, 1);
    }
    expect(verseIds.size).toBe(days.length); // each verse appears once per cycle
    expect(pairings.size).toBe(days.length);
  });

  it('finds plans by id and rejects unknown ids', () => {
    expect(repo.plan('lords-prayer')?.days).toHaveLength(7);
    expect(repo.plan('nope')).toBeUndefined();
  });
});

describe('feastsForYear', () => {
  it('returns the spare Protestant set sorted by date for 2026', () => {
    const feasts = repo.feastsForYear(2026, 'protestant');
    const byId = Object.fromEntries(feasts.map((f) => [f.id, f.date]));
    expect(byId['new-year']).toBe('2026-01-01');
    expect(byId['palmSunday']).toBe('2026-03-29');
    expect(byId['goodFriday']).toBe('2026-04-03');
    expect(byId['easter']).toBe('2026-04-05');
    expect(byId['pentecost']).toBe('2026-05-24');
    expect(byId['christmas']).toBe('2026-12-25');
    expect(byId['watch-night']).toBe('2026-12-31');
    const dates = feasts.map((f) => f.date);
    expect([...dates].sort()).toEqual(dates);
    // No saints, no Lent in the Protestant layer.
    expect(byId['ashWednesday']).toBeUndefined();
    expect(byId['st-thomas']).toBeUndefined();
  });

  it('includes Catholic movables, Marian days and India feasts', () => {
    const byId = Object.fromEntries(repo.feastsForYear(2026, 'catholic').map((f) => [f.id, f.date]));
    expect(byId['ashWednesday']).toBe('2026-02-18');
    expect(byId['holyThursday']).toBe('2026-04-02');
    expect(byId['ascension']).toBe('2026-05-14');
    expect(byId['corpusChristi']).toBe('2026-06-07');
    expect(byId['christTheKing']).toBe('2026-11-22');
    expect(byId['adventStart']).toBe('2026-11-29');
    expect(byId['st-thomas']).toBe('2026-07-03');
    expect(byId['velankanni-novena']).toBe('2026-08-29');
    expect(byId['velankanni']).toBe('2026-09-08');
    expect(byId['assumption']).toBe('2026-08-15');
    expect(byId['francis-xavier']).toBe('2026-12-03');
  });

  it('includes the East Syriac high days for the orthodox layer', () => {
    const byId = Object.fromEntries(repo.feastsForYear(2026, 'orthodox').map((f) => [f.id, f.date]));
    expect(byId['dukrana']).toBe('2026-07-03');
    expect(byId['denha']).toBe('2026-01-06');
    expect(byId['sliba']).toBe('2026-09-14');
    expect(byId['peturta']).toBe('2026-02-15'); // Easter − 49
    expect(byId['pesaha']).toBe('2026-04-02');
    expect(byId['easter']).toBe('2026-04-05');
  });

  it('localizes every feast name and reading across traditions', () => {
    for (const tradition of ['protestant', 'catholic', 'orthodox'] as const) {
      for (const feast of repo.feastsForYear(2026, tradition)) {
        expectLocalized(feast.name, feast.id);
        if (feast.readings) {
          expectLocalized(feast.readings, feast.id);
        }
      }
    }
  });
});

describe('hymns', () => {
  it('has a non-empty hymnal with unique ids', () => {
    expect(hymns.length).toBeGreaterThanOrEqual(6);
    expect(new Set(hymns.map((h) => h.id)).size).toBe(hymns.length);
  });

  it('every hymn is bilingual-titled with Telugu stanzas and transliterations', () => {
    for (const hymn of hymns) {
      expectLocalized(hymn.title, hymn.id);
      expect(hymn.stanzas.length).toBeGreaterThan(0);
      for (const stanza of hymn.stanzas) {
        expect(stanza.te).toMatch(/[ఀ-౿]/);
        expect(stanza.translit.trim().length).toBeGreaterThan(0);
        // Transliteration stays Latin — no Telugu glyphs.
        expect(stanza.translit).not.toMatch(/[ఀ-౿]/);
      }
      if (hymn.source === 'scripture') {
        expectLocalized(hymn.reference!, hymn.id);
      }
    }
  });

  it('resolves hymns by id via the repository', () => {
    expect(repo.hymn('psalm-23')?.stanzas.length).toBeGreaterThan(0);
    expect(repo.hymn('nope')).toBeUndefined();
  });
});

describe('festival cards', () => {
  it('covers the four occasions with bilingual greetings and verses', () => {
    expect(festivalCards.map((f) => f.id).sort()).toEqual(
      ['christmas', 'easter', 'feast', 'goodfriday'].sort(),
    );
    for (const card of festivalCards) {
      expectLocalized(card.label, card.id);
      expectLocalized(card.greeting, card.id);
      expectLocalized(card.verse.text, card.id);
      expectLocalized(card.verse.reference, card.id);
    }
  });
});

describe('storefront catalog', () => {
  it('has a curated catalog with unique ids and sane prices', () => {
    expect(products.length).toBeGreaterThanOrEqual(8);
    expect(new Set(products.map((p) => p.id)).size).toBe(products.length);
    for (const product of products) {
      expectLocalized(product.name, product.id);
      expectLocalized(product.description, product.id);
      expect(product.priceInr).toBeGreaterThan(0);
      expect(product.emoji.trim().length).toBeGreaterThan(0);
    }
  });

  it('starts clean: Bibles and frames are present', () => {
    const categories = new Set(products.map((p) => p.category));
    expect(categories.has('bibles')).toBe(true);
    expect(categories.has('frames')).toBe(true);
  });

  it('NEVER carries health, healing or protection claims (DMR Act, 1954)', () => {
    // English claim words + Telugu medical-claim words. The faith-object
    // framing must hold in every listing, both languages.
    const banned = [
      /heal(s|ing|ed)?\b/i,
      /cure(s|d)?\b/i,
      /miracle/i,
      /remedy/i,
      /protect(s|ion)? from (disease|sickness|illness|evil)/i,
      /disease/i,
      /స్వస్థత/,
      /నయం/,
      /రోగ/,
      /వ్యాధి/,
      /చికిత్స/,
      /అద్భుత శక్తి/,
    ];
    for (const product of products) {
      const copy = `${product.name.en} ${product.name.te} ${product.description.en} ${product.description.te}`;
      for (const pattern of banned) {
        expect(copy).not.toMatch(pattern);
      }
    }
  });

  it('flags the devotional-oil class for the compliance notice', () => {
    const oil = products.find((p) => p.id === 'devotional-oil');
    expect(oil?.complianceNote).toBe(true);
  });

  it('resolves products by id via the repository', () => {
    expect(repo.product('telugu-bible-large')?.category).toBe('bibles');
    expect(repo.product('nope')).toBeUndefined();
  });
});

describe('seasonFor', () => {
  it('returns null for the Protestant layer', () => {
    expect(repo.seasonFor('2026-03-01', 'protestant')).toBeNull();
  });

  it('returns Lent with a navy tint for a Catholic date in March', () => {
    const season = repo.seasonFor('2026-03-01', 'catholic');
    expect(season?.id).toBe('lent');
    expect(season?.tint).toBe('navy');
    expectLocalized(season!.name, 'lent');
  });

  it('returns the Great Fast for the orthodox layer on the same date', () => {
    const season = repo.seasonFor('2026-03-01', 'orthodox');
    expect(season?.id).toBe('greatFast');
    expect(season?.tint).toBe('navy');
  });

  it('returns gold Eastertide / Qyamta after Easter', () => {
    expect(repo.seasonFor('2026-04-10', 'catholic')).toMatchObject({ id: 'eastertide', tint: 'gold' });
    expect(repo.seasonFor('2026-04-10', 'orthodox')).toMatchObject({ id: 'qyamta', tint: 'gold' });
  });
});
