import * as Notifications from 'expo-notifications';

import { getContentRepository } from '@/content/bundled';
import type { Tradition } from '@/content/types';
import { addDays, fromDateKey, toDateKey } from '@/domain/dates';
import { t } from '@/i18n';
import type { ReminderTime } from '@/stores/settings';
import type { Lang } from '@/theme';
import { scheduleCascadeNotifications } from '@/services/notification-scheduler';

/**
 * Local notifications, fully offline and deliberately gentle:
 * - ONE daily morning nudge (DAILY trigger, calm copy)
 * - up to four batched feast reminders (day before, 8:00) for the
 *   gold-accent feasts of the user's tradition
 * No exact-alarm permission; OS batching slack is acceptable.
 */
const DAILY_CHANNEL = 'daily';
const FEAST_CHANNEL = 'feasts';
const DAILY_PREFIX = 'daily-';
const FEAST_PREFIX = 'feast-';
const MAX_FEAST_REMINDERS = 4;
const FEAST_LOOKAHEAD_DAYS = 90;
const DAILY_WINDOW_DAYS = 7;

const isWeb = () => process.env.EXPO_OS === 'web';

export function configureNotificationHandling(): void {
  if (isWeb()) {
    return; // local scheduled notifications are a phone feature
  }
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (isWeb()) {
    return false;
  }
  if (process.env.EXPO_OS === 'android') {
    await Notifications.setNotificationChannelAsync(DAILY_CHANNEL, {
      name: 'Daily verse',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
    await Notifications.setNotificationChannelAsync(FEAST_CHANNEL, {
      name: 'Feast reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) {
    return true;
  }
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

async function cancelByPrefix(prefix: string): Promise<void> {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    all
      .filter((n) => n.identifier.startsWith(prefix))
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier).catch(() => {})),
  );
}

/**
 * A rolling 7-day window of dated reminders, each carrying that day's
 * ACTUAL verse — the hook lands before the app even opens. Resynced on
 * every launch, so the window always rolls forward.
 */
async function scheduleDailyWindow(time: ReminderTime, lang: Lang): Promise<void> {
  const repo = getContentRepository();
  const now = new Date();
  const today = toDateKey(now);

  for (let offset = 0; offset < DAILY_WINDOW_DAYS; offset++) {
    const date = addDays(today, offset);
    const fireDate = fromDateKey(date);
    fireDate.setHours(time.hour, time.minute, 0, 0);
    if (fireDate <= now) {
      continue; // today's moment already passed — start tomorrow
    }
    const verse = repo.verseFor(date);
    const text = verse.text[lang];
    const body = `“${text.length > 120 ? `${text.slice(0, 117)}…` : text}” — ${verse.reference[lang]}`;
    await Notifications.scheduleNotificationAsync({
      identifier: `${DAILY_PREFIX}${date}`,
      content: {
        title: t('notificationTitle', lang),
        body,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: fireDate,
        channelId: DAILY_CHANNEL,
      },
    });
  }
}

/** Day-before 8:00 reminders for the next gold feasts of the tradition. */
async function scheduleFeasts(tradition: Tradition, lang: Lang): Promise<void> {
  const repo = getContentRepository();
  const today = toDateKey(new Date());
  const horizon = addDays(today, FEAST_LOOKAHEAD_DAYS);
  const year = Number(today.slice(0, 4));

  const upcoming = [...repo.feastsForYear(year, tradition), ...repo.feastsForYear(year + 1, tradition)]
    .filter((f) => f.accent === 'gold' && f.date > today && f.date <= horizon)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, MAX_FEAST_REMINDERS);

  const now = new Date();
  for (const feast of upcoming) {
    const fireDate = fromDateKey(addDays(feast.date, -1));
    fireDate.setHours(8, 0, 0, 0);
    if (fireDate <= now) {
      continue; // the day-before moment already passed
    }
    await Notifications.scheduleNotificationAsync({
      identifier: `${FEAST_PREFIX}${feast.id}-${feast.date}`,
      content: {
        title: t('notificationTitle', lang),
        body: `${t('tomorrow', lang)}: ${feast.name[lang]} 🌟`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: fireDate,
        channelId: FEAST_CHANNEL,
      },
    });
  }
}

export interface NotificationSyncOptions {
  enabled: boolean;
  time: ReminderTime;
  lang: Lang;
  tradition: Tradition;
}

/**
 * Idempotently reconciles everything scheduled with current settings.
 * Call on app start and whenever reminder/tradition/language change.
 */
export async function syncNotifications(options: NotificationSyncOptions): Promise<void> {
  if (isWeb()) {
    return;
  }
  try {
    await Promise.all([cancelByPrefix(DAILY_PREFIX), cancelByPrefix(FEAST_PREFIX)]);
    // Legacy single repeating reminder from earlier versions.
    await Notifications.cancelScheduledNotificationAsync('daily-reminder').catch(() => {});
    if (!options.enabled) {
      await cancelByPrefix('cascade-');
      return;
    }
    await scheduleDailyWindow(options.time, options.lang);
    await scheduleFeasts(options.tradition, options.lang);
    await scheduleCascadeNotifications(options.time, options.lang);
  } catch (error) {
    console.warn('[notifications] sync failed', error);
  }
}
