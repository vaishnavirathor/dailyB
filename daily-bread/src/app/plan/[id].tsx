import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';

import { CheckIcon } from '@/components/icons';
import { Screen } from '@/components/screen';
import { ScreenHeader } from '@/components/screen-header';
import { ThemedText } from '@/components/themed-text';
import { getContentRepository } from '@/content/bundled';
import { completedPlanDays, setPlanDayCompleted } from '@/data/plan-progress';
import { t } from '@/i18n';
import { useLanguage } from '@/stores/settings';
import { colors, radius, spacing, tints } from '@/theme';

/** Reading-plan detail: 7 days, tap a day's circle to mark it read. */
export default function PlanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lang = useLanguage();
  const plan = getContentRepository().plan(id);
  const [done, setDone] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (plan) {
      void completedPlanDays(plan.id).then(setDone);
    }
  }, [plan]);

  if (!plan) {
    return (
      <Screen>
        <ThemedText variant="bodyMd" color="onSurfaceVariant">
          —
        </ThemedText>
      </Screen>
    );
  }

  const toggle = (index: number) => {
    const next = new Set(done);
    const completing = !next.has(index);
    if (completing) {
      next.add(index);
    } else {
      next.delete(index);
    }
    setDone(next);
    void setPlanDayCompleted(plan.id, index, completing);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen gap={spacing.stackMd}>
        <ScreenHeader
          eyebrow={t('readingPlans', lang)}
          title={plan.title[lang]}
          subtitle={plan.description[lang]}
        />
        <View style={{ gap: spacing.gutter }}>
          {plan.days.map((day, index) => {
            const completed = done.has(index);
            return (
              <Pressable
                key={index}
                accessibilityRole="button"
                onPress={() => toggle(index)}
                style={{
                  backgroundColor: colors.surfaceContainerLowest,
                  borderWidth: 1,
                  borderColor: completed ? colors.sage : colors.outlineVariant,
                  borderRadius: radius.lg,
                  borderCurve: 'continuous',
                  padding: spacing.stackMd,
                  gap: spacing.stackSm,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.stackSm }}>
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: radius.full,
                      borderWidth: completed ? 0 : 1,
                      borderColor: colors.outlineVariant,
                      backgroundColor: completed ? colors.sage : 'transparent',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {completed ? (
                      <CheckIcon size={16} color={colors.onPrimary} strokeWidth={2} />
                    ) : (
                      <ThemedText variant="labelSm" color="onSurfaceVariant">
                        {index + 1}
                      </ThemedText>
                    )}
                  </View>
                  <ThemedText variant="labelMd" color="onSurfaceVariant" style={{ letterSpacing: 1.6 }}>
                    {t('day', lang)} {index + 1} · {day.reference[lang]}
                  </ThemedText>
                </View>
                <ThemedText variant="bodyLg" color="primary">
                  {day.text[lang]}
                </ThemedText>
                <View
                  style={{
                    backgroundColor: tints.dailyLoop,
                    borderRadius: radius.base,
                    padding: spacing.stackSm,
                  }}
                >
                  <ThemedText variant="bodySm" style={{ color: colors.sage }}>
                    {day.thought[lang]}
                  </ThemedText>
                </View>
              </Pressable>
            );
          })}
        </View>
      </Screen>
    </>
  );
}
