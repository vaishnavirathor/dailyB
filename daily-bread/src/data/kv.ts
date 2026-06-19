import Storage from 'expo-sqlite/kv-store';

import type { FontScale, ReminderTime, Tradition } from '@/stores/settings';
import type { Lang } from '@/theme';

/**
 * Key-value persistence on expo-sqlite/kv-store — one storage engine for
 * the whole app, via the ASYNC API (sync calls time out on web's worker
 * channel). Keys are versioned; bump only with a migration path.
 */
const KEYS = {
  settings: 'settings.v1',
  onboarding: 'onboarding.v1',
  milestones: 'milestones.v1',
  ttsHintShown: 'tts-hint.v1',
  curtainShown: 'curtain-shown.v1',
  lastRead: 'bible-last-read.v1',
} as const;

export interface LastRead {
  bookId: string;
  chapter: number; // 0-based
  /** Edition; rows persisted before v3 default to the Telugu OV. */
  version?: string;
}

export interface PersistedSettings {
  language: Lang;
  tradition: Tradition;
  reminderTime: ReminderTime;
  notificationsEnabled: boolean;
  fontScale: FontScale;
  curtainEnabled: boolean;
  ttsGender: 'auto' | 'female' | 'male';
  ttsVoiceTe: string | null;
  ttsVoiceEn: string | null;
  hdVoiceEnabled: boolean;
  hdProvider: 'azure' | 'sarvam' | 'elevenlabs';
}

export async function loadSettings(): Promise<Partial<PersistedSettings>> {
  try {
    const raw = await Storage.getItem(KEYS.settings);
    return raw ? (JSON.parse(raw) as Partial<PersistedSettings>) : {};
  } catch (error) {
    console.warn('[kv] failed to load settings', error);
    return {};
  }
}

export async function saveSettings(settings: PersistedSettings): Promise<void> {
  try {
    await Storage.setItem(KEYS.settings, JSON.stringify(settings));
  } catch (error) {
    console.warn('[kv] failed to save settings', error);
  }
}

export async function isOnboardingComplete(): Promise<boolean> {
  try {
    return (await Storage.getItem(KEYS.onboarding)) === '1';
  } catch {
    return false;
  }
}

export async function setOnboardingComplete(): Promise<void> {
  try {
    await Storage.setItem(KEYS.onboarding, '1');
  } catch (error) {
    console.warn('[kv] failed to persist onboarding flag', error);
  }
}

export async function celebratedMilestones(): Promise<number[]> {
  try {
    const raw = await Storage.getItem(KEYS.milestones);
    return raw ? (JSON.parse(raw) as number[]) : [];
  } catch {
    return [];
  }
}

export async function addCelebratedMilestone(milestone: number): Promise<void> {
  const all = await celebratedMilestones();
  if (!all.includes(milestone)) {
    await Storage.setItem(KEYS.milestones, JSON.stringify([...all, milestone]));
  }
}

export async function lastRead(): Promise<LastRead | null> {
  try {
    const raw = await Storage.getItem(KEYS.lastRead);
    return raw ? (JSON.parse(raw) as LastRead) : null;
  } catch {
    return null;
  }
}

export async function setLastRead(value: LastRead): Promise<void> {
  try {
    await Storage.setItem(KEYS.lastRead, JSON.stringify(value));
  } catch {
    // non-critical
  }
}

/** Date key of the last daily-curtain showing, or null. */
export async function curtainShownDate(): Promise<string | null> {
  try {
    return await Storage.getItem(KEYS.curtainShown);
  } catch {
    return null;
  }
}

export async function setCurtainShownDate(date: string): Promise<void> {
  try {
    await Storage.setItem(KEYS.curtainShown, date);
  } catch {
    // non-critical — worst case the curtain shows again
  }
}

export async function wasTtsHintShown(): Promise<boolean> {
  try {
    return (await Storage.getItem(KEYS.ttsHintShown)) === '1';
  } catch {
    return false;
  }
}

export async function setTtsHintShown(): Promise<void> {
  try {
    await Storage.setItem(KEYS.ttsHintShown, '1');
  } catch {
    // non-critical
  }
}
