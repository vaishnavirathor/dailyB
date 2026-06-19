import { create } from 'zustand';

import type { Tradition } from '@/content/types';
import type { Lang } from '@/theme';

export type FontScale = 'normal' | 'large' | 'xl';
export type VoiceGender = 'auto' | 'female' | 'male';
export type HdVoiceProvider = 'azure' | 'sarvam' | 'elevenlabs';
export type { Tradition };

export interface ReminderTime {
  hour: number;
  minute: number;
}

export interface SettingsState {
  language: Lang;
  tradition: Tradition;
  reminderTime: ReminderTime;
  notificationsEnabled: boolean;
  fontScale: FontScale;
  /** Once-a-day full-screen promise curtain (opt-in). */
  curtainEnabled: boolean;
  /** Read-aloud voice preferences (the "pastor voice"). */
  ttsGender: VoiceGender;
  ttsVoiceTe: string | null;
  ttsVoiceEn: string | null;
  /** HD neural voice via the backend (needs internet + server keys). */
  hdVoiceEnabled: boolean;
  hdProvider: HdVoiceProvider;
  /** User-chosen Telugu fonts — stored as font family strings. */
  teluguHeadingFont: string;
  teluguBodyFont: string;
  /** True once persisted settings have been loaded at startup. */
  hydrated: boolean;
  /** Gate for the (onboarding) ↔ (tabs) protected routes. */
  onboarded: boolean;
  setLanguage: (language: Lang) => void;
  setTradition: (tradition: Tradition) => void;
  setReminderTime: (time: ReminderTime) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setFontScale: (scale: FontScale) => void;
  setCurtainEnabled: (enabled: boolean) => void;
  setTtsGender: (gender: VoiceGender) => void;
  setTtsVoice: (lang: Lang, voiceId: string | null) => void;
  setHdVoiceEnabled: (enabled: boolean) => void;
  setHdProvider: (provider: HdVoiceProvider) => void;
  setTeluguHeadingFont: (font: string) => void;
  setTeluguBodyFont: (font: string) => void;
  completeOnboarding: () => void;
  hydrate: (partial: Partial<SettingsState>) => void;
}

export const DEFAULT_REMINDER: ReminderTime = { hour: 6, minute: 30 };

/**
 * In-memory settings store. Persistence is wired in src/data/kv.ts —
 * the root layout hydrates this store at startup and every setter is
 * mirrored to the KV store there (keeps this module free of IO).
 */
export const useSettings = create<SettingsState>((set) => ({
  language: 'te',
  tradition: 'protestant',
  reminderTime: DEFAULT_REMINDER,
  notificationsEnabled: false,
  fontScale: 'normal',
  curtainEnabled: false, // opt-in via Settings
  ttsGender: 'auto',
  ttsVoiceTe: null,
  ttsVoiceEn: null,
  hdVoiceEnabled: false,
  hdProvider: 'azure',
  teluguHeadingFont: 'Suranna_400Regular',
  teluguBodyFont: 'NTR_400Regular',
  hydrated: false,
  onboarded: false,
  setLanguage: (language) => set({ language }),
  setTradition: (tradition) => set({ tradition }),
  setReminderTime: (reminderTime) => set({ reminderTime }),
  setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
  setFontScale: (fontScale) => set({ fontScale }),
  setCurtainEnabled: (curtainEnabled) => set({ curtainEnabled }),
  setTtsGender: (ttsGender) => set({ ttsGender }),
  setTtsVoice: (lang, voiceId) =>
    set(lang === 'te' ? { ttsVoiceTe: voiceId } : { ttsVoiceEn: voiceId }),
  setHdVoiceEnabled: (hdVoiceEnabled) => set({ hdVoiceEnabled }),
  setHdProvider: (hdProvider) => set({ hdProvider }),
  setTeluguHeadingFont: (teluguHeadingFont) => set({ teluguHeadingFont }),
  setTeluguBodyFont: (teluguBodyFont) => set({ teluguBodyFont }),
  completeOnboarding: () => set({ onboarded: true }),
  hydrate: (partial) => set({ ...partial, hydrated: true }),
}));

export function useLanguage(): Lang {
  return useSettings((s) => s.language);
}

export const fontScaleFactor: Record<FontScale, number> = {
  normal: 1,
  large: 1.25,
  xl: 1.5,
};
