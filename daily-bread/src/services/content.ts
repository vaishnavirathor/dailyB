import { getContentRepository } from '@/content/bundled';
import { selectIndex } from '@/domain/daily-selection';
import { toDateKey } from '@/domain/dates';
import { api } from '@/services/api';
import { useAuth } from '@/stores/auth';
import * as cache from '@/data/content-cache';
import type { NotificationConfig } from '@/data/content-cache';

const PROMISE_SALT = 7;
const MIN_PROMISE_BUFFER = 10;

function mapApiPromise(p: {
  id: string; category: string; reference: { en: string; te: string };
  text: { en: string; te: string };
}, gender: string): {
  id: string; category: string; referenceEn: string; referenceTe: string;
  textEn: string; textTe: string; gender: string;
} {
  return {
    id: p.id,
    category: p.category,
    referenceEn: p.reference.en,
    referenceTe: p.reference.te,
    textEn: p.text.en,
    textTe: p.text.te,
    gender,
  };
}

async function fetchAndCacheAllPromises(): Promise<void> {
  try {
    const profile = useAuth.getState().profile;
    const gender = profile?.gender ?? undefined;

    const res = await api.get<{
      promises: { id: string; category: string; reference: { en: string; te: string }; text: { en: string; te: string } }[];
      total: number;
    }>(`/content/promises?limit=50&offset=0${gender ? `&gender=${gender}` : ''}`);

    const mapped = res.promises.map((p) => mapApiPromise(p, gender ?? 'general'));
    await cache.cachePromises(mapped);
  } catch (err) {
    console.warn('[content] failed to fetch promises', err);
  }
}

export async function ensurePromiseBuffer(): Promise<void> {
  const count = await cache.countCachedPromises();
  if (count < MIN_PROMISE_BUFFER) {
    await fetchAndCacheAllPromises();
  }
}

export async function fetchAndCacheNotificationConfig(): Promise<NotificationConfig | null> {
  try {
    const config = await api.get<NotificationConfig>('/content/notification-config');
    await cache.cacheNotificationConfig(config);
    return config;
  } catch (err) {
    console.warn('[content] failed to fetch notification config', err);
    return null;
  }
}

export async function getTodaysPromise(): Promise<{
  id: string; category: string; reference: { en: string; te: string };
  text: { en: string; te: string };
} | null> {
  const all = await cache.getAllCachedPromises();
  if (all.length === 0) return null;

  const today = toDateKey(new Date());
  const idx = selectIndex(today, all.length, PROMISE_SALT);
  const p = all[idx];
  if (!p) return null;

  return {
    id: p.id,
    category: p.category,
    reference: { en: p.referenceEn, te: p.referenceTe },
    text: { en: p.textEn, te: p.textTe },
  };
}

export async function getTodaysVerse(): Promise<{
  reference: { en: string; te: string }; text: { en: string; te: string };
}> {
  const repo = getContentRepository();
  const today = toDateKey(new Date());
  const verse = repo.verseFor(today);
  return {
    reference: verse.reference,
    text: verse.text,
  };
}

export async function getCachedNotificationConfig(): Promise<NotificationConfig | null> {
  return cache.getCachedNotificationConfig();
}
