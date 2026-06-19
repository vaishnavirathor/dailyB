import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { BellIcon } from '@/components/icons';
import { ThemedText } from '@/components/themed-text';
import { setOnboardingComplete } from '@/data/kv';
import { t } from '@/i18n';
import { requestNotificationPermission, syncNotifications } from '@/services/notifications';
import { useLanguage, useSettings } from '@/stores/settings';
import { colors, fonts, radius, spacing, tints } from '@/theme';

/**
 * Final onboarding step: one well-timed morning nudge, entirely optional.
 * Finishing (either way) flips the protected-route gate to the tabs.
 */
export default function ReminderScreen() {
  const lang = useLanguage();
  const insets = useSafeAreaInsets();
  const reminderTime = useSettings((s) => s.reminderTime);
  const setReminderTime = useSettings((s) => s.setReminderTime);
  const setNotificationsEnabled = useSettings((s) => s.setNotificationsEnabled);
  const completeOnboarding = useSettings((s) => s.completeOnboarding);
  const [showPicker, setShowPicker] = useState(process.env.EXPO_OS === 'ios');
  const [busy, setBusy] = useState(false);

  const pickerValue = new Date();
  pickerValue.setHours(reminderTime.hour, reminderTime.minute, 0, 0);

  const onPicked = (date: Date) => {
    if (process.env.EXPO_OS === 'android') {
      setShowPicker(false);
    }
    setReminderTime({ hour: date.getHours(), minute: date.getMinutes() });
  };

  const finish = () => {
    void setOnboardingComplete(); // persisted in background; gate flips now
    completeOnboarding();
  };

  const enable = async () => {
    setBusy(true);
    try {
      const granted = await requestNotificationPermission();
      setNotificationsEnabled(granted);
      if (granted) {
        await syncNotifications({
          enabled: true,
          time: reminderTime,
          lang,
          tradition: useSettings.getState().tradition,
        });
      }
    } finally {
      setBusy(false);
      finish();
    }
  };

  const isWeb = process.env.EXPO_OS === 'web';

  const formatted = formatTime(reminderTime.hour, reminderTime.minute);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.surface }}
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: 'center',
        padding: spacing.containerMargin,
        paddingTop: insets.top + spacing.stackLg,
        paddingBottom: insets.bottom + spacing.stackLg,
        gap: spacing.stackLg,
      }}
    >
      <View style={{ alignItems: 'center', gap: spacing.stackSm }}>
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: radius.full,
            backgroundColor: tints.dailyLoop,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <BellIcon size={28} color={colors.sage} />
        </View>
        <ThemedText variant="headlineMd" color="primary" align="center">
          {t('onboardingReminderTitle', lang)}
        </ThemedText>
        <ThemedText variant="bodyMd" color="onSurfaceVariant" align="center">
          {t('onboardingReminderSub', lang)}
        </ThemedText>
      </View>

      <View style={{ gap: spacing.gutter, alignItems: 'center' }}>
        {process.env.EXPO_OS === 'android' || isWeb ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => setShowPicker(true)}
            style={{
              borderBottomWidth: 1,
              borderBottomColor: colors.outlineVariant,
              paddingVertical: 8,
              paddingHorizontal: spacing.stackMd,
            }}
          >
            <ThemedText
              style={{ fontFamily: fonts.serifSemiBold, fontSize: 40, lineHeight: 52, color: colors.primary }}
            >
              {formatted}
            </ThemedText>
          </Pressable>
        ) : null}
        {showPicker && !isWeb ? (
          <DateTimePicker
            value={pickerValue}
            mode="time"
            display={process.env.EXPO_OS === 'ios' ? 'spinner' : 'default'}
            onChange={(_event, date) => {
              if (_event.type === 'dismissed') {
                setShowPicker(false);
                return;
              }
              if (date) onPicked(date);
            }}
          />
        ) : null}
      </View>

      <View style={{ gap: spacing.gutter }}>
        {/* Local scheduled notifications are a phone feature — web just continues. */}
        {isWeb ? (
          <Button label={t('continueLabel', lang)} onPress={finish} disabled={busy} />
        ) : (
          <>
            <Button label={t('enableReminder', lang)} onPress={enable} disabled={busy} />
            <Button label={t('skip', lang)} variant="secondary" onPress={finish} disabled={busy} />
          </>
        )}
      </View>
    </ScrollView>
  );
}

function formatTime(hour: number, minute: number): string {
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  const suffix = hour < 12 ? 'AM' : 'PM';
  return `${h12}:${String(minute).padStart(2, '0')} ${suffix}`;
}
