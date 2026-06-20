import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';

import { ensurePromiseBuffer, fetchAndCacheNotificationConfig } from '@/services/content';
import { scheduleCascadeNotifications } from '@/services/notification-scheduler';
import { useSettings } from '@/stores/settings';

const BACKGROUND_FETCH_TASK = 'daily-bread-content-refill';

TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    console.log('[background-fetch] running content refill');
    await ensurePromiseBuffer();
    console.log('[background-fetch] promise buffer checked');

    const config = await fetchAndCacheNotificationConfig();
    if (config) {
      const settings = useSettings.getState();
      if (settings.notificationsEnabled) {
        await scheduleCascadeNotifications(settings.reminderTime, settings.language);
      }
    }

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.warn('[background-fetch] task failed', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export async function registerBackgroundFetch(): Promise<void> {
  if (process.env.EXPO_OS === 'web') return;

  const status = await BackgroundFetch.getStatusAsync();
  if (status === BackgroundFetch.BackgroundFetchStatus.Denied) {
    console.warn('[background-fetch] denied');
    return;
  }

  const existing = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);
  if (existing) return;

  await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
    minimumInterval: 60 * 30,
    stopOnTerminate: false,
    startOnBoot: true,
  });

  console.log('[background-fetch] registered');
}

export async function unregisterBackgroundFetch(): Promise<void> {
  if (process.env.EXPO_OS === 'web') return;
  const existing = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);
  if (existing) {
    await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
    console.log('[background-fetch] unregistered');
  }
}
