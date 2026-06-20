import * as Notifications from 'expo-notifications';

import { useProgress } from '@/stores/progress';
import type { ReminderTime } from '@/stores/settings';
import type { Lang } from '@/theme';
import type { NotificationConfig, CascadeSlot } from '@/data/content-cache';
import { getCachedNotificationConfig } from '@/services/content';

const CASCADE_PREFIX = 'cascade-';
const STREAK_CHECK_ID = 'evening-streak';

const isWeb = () => process.env.EXPO_OS === 'web';

async function cancelCascade(): Promise<void> {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    all
      .filter((n) => n.identifier.startsWith(CASCADE_PREFIX))
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier).catch(() => {})),
  );
}

export async function scheduleCascadeNotifications(
  baseTime: ReminderTime,
  lang: Lang,
): Promise<void> {
  if (isWeb()) return;

  try {
    await cancelCascade();

    const progress = useProgress.getState();
    const config = await getCachedNotificationConfig();
    if (!config || config.cascade.length === 0) return;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const base = new Date(today);
    base.setHours(baseTime.hour, baseTime.minute, 0, 0);

    for (let i = 0; i < config.cascade.length; i++) {
      const slot: CascadeSlot = config.cascade[i];
      const offsetHours = config.cascade_hours[i] ?? (i + 1) * 3;
      const fireDate = new Date(base.getTime() + offsetHours * 3600 * 1000);

      if (fireDate <= now) continue;

      if (slot.type === 'streak_check' && progress.activity.verseSeen) {
        continue;
      }

      await Notifications.scheduleNotificationAsync({
        identifier: `${CASCADE_PREFIX}${slot.id}`,
        content: {
          title: slot.title,
          body: slot.body,
          data: { type: slot.type },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: fireDate,
        },
      });
    }
  } catch (error) {
    console.warn('[notification-scheduler] cascade failed', error);
  }
}

export async function cancelCascadeNotifications(): Promise<void> {
  if (isWeb()) return;
  await cancelCascade();
}

export async function cancelStreakCheckNotification(): Promise<void> {
  if (isWeb()) return;
  await Notifications.cancelScheduledNotificationAsync(`${CASCADE_PREFIX}${STREAK_CHECK_ID}`)
    .catch(() => {});
}
