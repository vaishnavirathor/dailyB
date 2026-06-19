import * as Speech from 'expo-speech';

import { useSettings } from '@/stores/settings';
import type { Lang } from '@/theme';

/**
 * Device text-to-speech v2 — the "pastor voice".
 *
 * - Lists the device's voices per language with a gender guess, so the
 *   user can pick a male/female Telugu or English voice in Settings.
 * - speak() resolves: explicitly chosen voice → gender preference →
 *   Enhanced quality → first available.
 * - Telugu capability gate stays: Android devices without the te-IN
 *   pack fail silently, so the UI hides listen controls when empty.
 */

export type VoiceGenderGuess = 'female' | 'male' | 'unknown';

export interface DeviceVoice {
  id: string;
  label: string;
  gender: VoiceGenderGuess;
  enhanced: boolean;
}

const voiceCache = new Map<Lang, DeviceVoice[]>();

function guessGender(identifier: string, name: string): VoiceGenderGuess {
  const haystack = `${identifier} ${name}`.toLowerCase();
  // Check 'female' before 'male' — the former contains the latter.
  if (/female|[#_-]tef|[#_-]f\b|\bf#/.test(haystack)) {
    return 'female';
  }
  if (/\bmale|[#_-]tem|[#_-]m\b|\bm#/.test(haystack)) {
    return 'male';
  }
  return 'unknown';
}

function langPrefix(lang: Lang): string {
  return lang === 'te' ? 'te' : 'en';
}

/** All device voices for a language, friendliest first. */
export async function listVoices(lang: Lang): Promise<DeviceVoice[]> {
  const cached = voiceCache.get(lang);
  if (cached) {
    return cached;
  }
  try {
    const all = await Speech.getAvailableVoicesAsync();
    const prefix = langPrefix(lang);
    const genderLabel: Record<VoiceGenderGuess, { en: string; te: string }> = {
      female: { en: 'Female', te: 'స్త్రీ' },
      male: { en: 'Male', te: 'పురుష' },
      unknown: { en: '', te: '' },
    };
    const voices = all
      .filter((v) => v.language?.toLowerCase().startsWith(prefix))
      .map((v, index) => {
        const gender = guessGender(v.identifier ?? '', v.name ?? '');
        const enhanced = v.quality === Speech.VoiceQuality.Enhanced;
        const parts = [
          `${lang === 'te' ? 'స్వరం' : 'Voice'} ${index + 1}`,
          genderLabel[gender][lang],
          enhanced ? 'HD' : '',
        ].filter(Boolean);
        return {
          id: v.identifier,
          label: parts.join(' · '),
          gender,
          enhanced,
        };
      })
      .sort((a, b) => Number(b.enhanced) - Number(a.enhanced));
    voiceCache.set(lang, voices);
    return voices;
  } catch (error) {
    console.warn('[tts] voice listing failed', error);
    return [];
  }
}

export async function isTtsAvailable(lang: Lang): Promise<boolean> {
  if (lang === 'en') {
    return true;
  }
  return (await listVoices('te')).length > 0;
}

/** Chosen voice → gender preference → Enhanced → first. */
async function resolveVoice(lang: Lang): Promise<string | null> {
  const voices = await listVoices(lang);
  if (voices.length === 0) {
    return null;
  }
  const settings = useSettings.getState();
  const chosen = lang === 'te' ? settings.ttsVoiceTe : settings.ttsVoiceEn;
  if (chosen && voices.some((v) => v.id === chosen)) {
    return chosen;
  }
  if (settings.ttsGender !== 'auto') {
    const byGender = voices.find((v) => v.gender === settings.ttsGender);
    if (byGender) {
      return byGender.id;
    }
  }
  return voices[0].id;
}

export interface SpeakHandlers {
  onDone?: () => void;
  onError?: () => void;
}

export async function speak(
  text: string,
  lang: Lang,
  handlers: SpeakHandlers = {},
  voiceOverride?: string,
): Promise<void> {
  await stopSpeaking();
  const voice = voiceOverride ?? (await resolveVoice(lang));
  if (lang === 'te' && voice === null) {
    handlers.onError?.();
    return;
  }
  const options: Speech.SpeechOptions = {
    rate: 0.95, // slightly unhurried — this is scripture, not a notification
    language: lang === 'te' ? 'te-IN' : 'en-IN',
    onDone: handlers.onDone,
    onError: handlers.onError,
  };
  if (voice) {
    options.voice = voice;
  }
  Speech.speak(text, options);
}

/** Preview a SPECIFIC voice (Settings picker). */
export function previewVoice(lang: Lang, voiceId: string | null): void {
  const sample =
    lang === 'te'
      ? 'యెహోవా నా కాపరి; నాకు లేమి కలుగదు.'
      : 'The Lord is my shepherd; I shall not want.';
  void speak(sample, lang, {}, voiceId ?? undefined);
}

/**
 * Read a sequence aloud (e.g. a chapter, verse by verse). Returns a stop
 * function; onIndex fires as each item begins so the UI can follow along.
 */
export function speakSequence(
  items: string[],
  lang: Lang,
  callbacks: { onIndex?: (index: number) => void; onDone?: () => void } = {},
): () => void {
  let cancelled = false;

  const step = (index: number) => {
    if (cancelled || index >= items.length) {
      if (!cancelled) {
        callbacks.onDone?.();
      }
      return;
    }
    callbacks.onIndex?.(index);
    void speak(items[index], lang, {
      onDone: () => step(index + 1),
      onError: () => step(index + 1),
    });
  };

  step(0);

  return () => {
    cancelled = true;
    void stopSpeaking();
  };
}

export async function stopSpeaking(): Promise<void> {
  try {
    await Speech.stop();
  } catch {
    // stopping an idle engine is a no-op failure we can ignore
  }
}
