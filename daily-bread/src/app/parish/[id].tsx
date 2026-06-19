import DateTimePicker from '@react-native-community/datetimepicker';
import { Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { getCommunityRepository } from '@/community';
import type { Parish, ServiceTime } from '@/community/types';
import { PreviewBanner } from '@/features/community/preview-banner';
import { t, weekdays } from '@/i18n';
import { useCommunity } from '@/stores/community';
import { useLanguage } from '@/stores/settings';
import { colors, radius, spacing, textStyle } from '@/theme';

/** Parish detail: approved timings grouped by weekday + crowd submission. */
export default function ParishDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lang = useLanguage();
  const [parish, setParish] = useState<Parish | null>(null);
  const [times, setTimes] = useState<ServiceTime[]>([]);
  const [adding, setAdding] = useState(false);
  const [weekday, setWeekday] = useState(0);
  const [time, setTime] = useState('08:00');
  const [showPicker, setShowPicker] = useState(false);
  const [label, setLabel] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const load = useCallback(async () => {
    await useCommunity.getState().connect();
    const repo = getCommunityRepository();
    const [parishes, parishTimes] = await Promise.all([
      repo.listParishes(''),
      repo.parishTimes(id),
    ]);
    setParish(parishes.find((p) => p.id === id) ?? null);
    setTimes(parishTimes);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const submit = async () => {
    try {
      await getCommunityRepository().submitServiceTime(id, {
        weekday,
        time,
        label: label.trim() || undefined,
      });
      setSubmitted(true);
      setAdding(false);
      setLabel('');
      await load();
    } catch (error) {
      console.warn('[parish] submit failed', error);
    }
  };

  const byDay = new Map<number, ServiceTime[]>();
  for (const serviceTime of times) {
    const list = byDay.get(serviceTime.weekday) ?? [];
    list.push(serviceTime);
    byDay.set(serviceTime.weekday, list);
  }

  const pickerValue = new Date();
  const [h, m] = time.split(':').map(Number);
  pickerValue.setHours(h, m, 0, 0);

  const inputStyle = textStyle('bodyMd', lang);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen gap={spacing.stackMd}>
        <View style={{ gap: 4 }}>
          <ThemedText
            variant="labelMd"
            color="secondary"
            style={{ textTransform: 'uppercase', letterSpacing: 2.6 }}
          >
            {t('massTimes', lang)}
          </ThemedText>
          <ThemedText variant="headlineMd" color="primary">
            {parish?.name ?? '…'}
          </ThemedText>
          {parish ? (
            <ThemedText variant="bodySm" color="onSurfaceVariant">
              {parish.city}
            </ThemedText>
          ) : null}
        </View>
        <PreviewBanner />

        {submitted ? (
          <ThemedText variant="bodySm" color="success" align="center">
            {t('submittedForReview', lang)}
          </ThemedText>
        ) : null}

        {times.length === 0 ? (
          <ThemedText variant="bodySm" color="onSurfaceVariant" align="center">
            {t('noTimesYet', lang)}
          </ThemedText>
        ) : (
          [...byDay.entries()]
            .sort((a, b) => a[0] - b[0])
            .map(([day, dayTimes]) => (
              <Card key={day} padding={spacing.gutter} style={{ gap: spacing.stackSm }}>
                <ThemedText
                  variant="labelMd"
                  color="secondary"
                  style={{ textTransform: 'uppercase', letterSpacing: 1.8 }}
                >
                  {weekdays[lang][day]}
                </ThemedText>
                {dayTimes.map((serviceTime) => (
                  <View
                    key={serviceTime.id}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.gutter }}
                  >
                    <ThemedText
                      variant="bodyMd"
                      color="primary"
                      style={{ fontVariant: ['tabular-nums'], minWidth: 64 }}
                    >
                      {formatTime12(serviceTime.time)}
                    </ThemedText>
                    <ThemedText variant="bodySm" color="onSurfaceVariant" style={{ flex: 1 }}>
                      {serviceTime.label ?? ''}
                    </ThemedText>
                  </View>
                ))}
              </Card>
            ))
        )}

        {adding ? (
          <Card padding={spacing.gutter} style={{ gap: spacing.stackSm }}>
            <ThemedText
              variant="labelMd"
              color="onSurfaceVariant"
              style={{ textTransform: 'uppercase', letterSpacing: 2.1 }}
            >
              {t('addTiming', lang)}
            </ThemedText>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {weekdays[lang].map((dayName, index) => (
                <Pressable
                  key={index}
                  accessibilityRole="button"
                  onPress={() => setWeekday(index)}
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 10,
                    borderRadius: radius.full,
                    borderWidth: 1,
                    borderColor: weekday === index ? colors.gold : colors.outlineVariant,
                    backgroundColor: weekday === index ? '#fffaf0' : colors.surfaceContainerLowest,
                  }}
                >
                  <ThemedText
                    variant="labelMd"
                    style={{ color: weekday === index ? colors.secondary : colors.onSurfaceVariant }}
                  >
                    {dayName.slice(0, 3)}
                  </ThemedText>
                </Pressable>
              ))}
            </View>

            {process.env.EXPO_OS === 'web' ? (
              <TextInput
                value={time}
                onChangeText={setTime}
                placeholder="08:00"
                placeholderTextColor={colors.outline}
                style={{
                  fontFamily: inputStyle.fontFamily,
                  fontSize: inputStyle.fontSize,
                  color: colors.onSurface,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.outlineVariant,
                  paddingVertical: spacing.stackSm - 4,
                }}
              />
            ) : (
              <Pressable accessibilityRole="button" onPress={() => setShowPicker(true)}>
                <ThemedText variant="headlineSm" color="primary">
                  {formatTime12(time)}
                </ThemedText>
              </Pressable>
            )}
            {showPicker ? (
              <DateTimePicker
                value={pickerValue}
                mode="time"
                display={process.env.EXPO_OS === 'ios' ? 'spinner' : 'default'}
                onChange={(_event, date) => {
                  if (_event.type === 'dismissed') {
                    setShowPicker(false);
                    return;
                  }
                  if (process.env.EXPO_OS === 'android') {
                    setShowPicker(false);
                  }
                  if (date) setTime(
                    `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`,
                  );
                }}
              />
            ) : null}

            <TextInput
              value={label}
              onChangeText={setLabel}
              placeholder={t('timingLabelPlaceholder', lang)}
              placeholderTextColor={colors.outline}
              maxLength={60}
              style={{
                fontFamily: inputStyle.fontFamily,
                fontSize: inputStyle.fontSize,
                color: colors.onSurface,
                borderBottomWidth: 1,
                borderBottomColor: colors.outlineVariant,
                paddingVertical: spacing.stackSm - 4,
              }}
            />
            <Button label={t('post', lang)} onPress={() => void submit()} />
          </Card>
        ) : (
          <Button label={t('addTiming', lang)} variant="secondary" onPress={() => setAdding(true)} />
        )}
      </Screen>
    </>
  );
}

function formatTime12(hhmm: string): string {
  const [hour, minute] = hhmm.split(':').map(Number);
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:${String(minute).padStart(2, '0')} ${hour < 12 ? 'AM' : 'PM'}`;
}
