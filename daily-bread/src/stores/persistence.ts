import { isOnboardingComplete, loadSettings, saveSettings } from '@/data/kv';
import { syncNotifications, type NotificationSyncOptions } from '@/services/notifications';
import { useSettings, type SettingsState } from '@/stores/settings';

/**
 * Bridges the settings store to the outside world. Called once from the
 * root layout: hydrates persisted values, then mirrors every change back
 * to disk and reconciles scheduled notifications when reminder-relevant
 * fields change. Keeps the store module itself IO-free.
 */
export async function initSettingsPersistence(): Promise<void> {
  const [persisted, onboarded] = await Promise.all([loadSettings(), isOnboardingComplete()]);
  useSettings.getState().hydrate({ ...persisted, onboarded });

  let prev = notifSlice(useSettings.getState());

  useSettings.subscribe((state) => {
    void saveSettings({
      language: state.language,
      tradition: state.tradition,
      reminderTime: state.reminderTime,
      notificationsEnabled: state.notificationsEnabled,
      fontScale: state.fontScale,
      curtainEnabled: state.curtainEnabled,
      ttsGender: state.ttsGender,
      ttsVoiceTe: state.ttsVoiceTe,
      ttsVoiceEn: state.ttsVoiceEn,
      hdVoiceEnabled: state.hdVoiceEnabled,
      hdProvider: state.hdProvider,
    });

    const next = notifSlice(state);
    if (JSON.stringify(next) !== JSON.stringify(prev)) {
      prev = next;
      void syncNotifications(next);
    }
  });
}

function notifSlice(state: SettingsState): NotificationSyncOptions {
  return {
    enabled: state.notificationsEnabled,
    time: state.reminderTime,
    lang: state.language,
    tradition: state.tradition,
  };
}
