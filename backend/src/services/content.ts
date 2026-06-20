import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { logger } from '../lib/logger.js';

interface Localized {
  en: string;
  te: string;
}

interface PromiseEntry {
  id: string;
  category: 'hope' | 'provision' | 'healing' | 'victory';
  reference: Localized;
  text: Localized;
}

interface PromisesCatalog {
  general: PromiseEntry[];
  gender: {
    male: PromiseEntry[];
    female: PromiseEntry[];
  };
}

interface CascadeSlot {
  id: string;
  type: 'prayer_reminder' | 'streak_check';
  label: string;
  title: string;
  body: string;
}

interface NotificationConfig {
  version: number;
  base_slot_label: string;
  cascade_hours: number[];
  cascade: CascadeSlot[];
}

let promisesCache: PromisesCatalog | null = null;
let configCache: NotificationConfig | null = null;

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = join(__dirname, '../../content');

function load<T>(filename: string): T {
  const path = join(CONTENT_DIR, filename);
  const raw = readFileSync(path, 'utf-8');
  return JSON.parse(raw) as T;
}

export function getPromisesCatalog(): PromisesCatalog {
  if (!promisesCache) {
    try {
      promisesCache = load<PromisesCatalog>('promises.json');
    } catch (err) {
      logger.error('failed to load promises catalog', { err });
      promisesCache = { general: [], gender: { male: [], female: [] } };
    }
  }
  return promisesCache;
}

export function getNotificationConfig(): NotificationConfig {
  if (!configCache) {
    try {
      configCache = load<NotificationConfig>('notification-config.json');
    } catch (err) {
      logger.error('failed to load notification config', { err });
      configCache = { version: 1, base_slot_label: 'Morning Verse', cascade_hours: [3, 6, 10], cascade: [] };
    }
  }
  return configCache;
}

export interface PromiseBatch {
  promises: PromiseEntry[];
  total: number;
  offset: number;
}

export function getPromises(
  options: { gender?: string; category?: string; limit?: number; offset?: number },
): PromiseBatch {
  const catalog = getPromisesCatalog();
  const limit = Math.min(options.limit ?? 10, 50);
  const offset = options.offset ?? 0;

  let pool = [...catalog.general];

  if (options.gender === 'male') {
    pool = [...pool, ...catalog.gender.male];
  } else if (options.gender === 'female') {
    pool = [...pool, ...catalog.gender.female];
  }

  if (options.category) {
    pool = pool.filter((p) => p.category === options.category);
  }

  const total = pool.length;
  const sliced = pool.slice(offset, offset + limit);

  return { promises: sliced, total, offset };
}
