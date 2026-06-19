import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { getContentRepository } from '@/content/bundled';
import { completedPlanDays } from '@/data/plan-progress';
import { t } from '@/i18n';
import { useLanguage } from '@/stores/settings';
import { colors, radius, spacing } from '@/theme';

/**
 * Horizontally scrolling plan chips with a thin Sage progress track —
 * never a loud percentage (design rule).
 */
export function PlanChips() {
  const router = useRouter();
  const lang = useLanguage();
  const plans = getContentRepository().plans();
  const [progress, setProgress] = useState<Record<string, number>>({});

  useFocusEffect(
    useCallback(() => {
      let active = true;
      void (async () => {
        const entries = await Promise.all(
          plans.map(async (plan) => [plan.id, (await completedPlanDays(plan.id)).size] as const),
        );
        if (active) {
          setProgress(Object.fromEntries(entries));
        }
      })();
      return () => {
        active = false;
      };
    }, [plans]),
  );

  return (
    <View style={{ gap: spacing.stackSm }}>
      <ThemedText
        variant="labelMd"
        color="onSurfaceVariant"
        style={{ textTransform: 'uppercase', letterSpacing: 2.1 }}
      >
        {t('readingPlans', lang)}
      </ThemedText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: spacing.stackSm, paddingRight: spacing.containerMargin }}
      >
        {plans.map((plan) => {
          const done = progress[plan.id] ?? 0;
          return (
            <Pressable
              key={plan.id}
              accessibilityRole="button"
              onPress={() => router.push({ pathname: '/plan/[id]', params: { id: plan.id } })}
              style={({ pressed }) => ({
                backgroundColor: colors.surfaceContainerLowest,
                borderWidth: 1,
                borderColor: pressed ? colors.gold : colors.outlineVariant,
                borderRadius: radius.md,
                borderCurve: 'continuous',
                paddingVertical: spacing.stackSm,
                paddingHorizontal: spacing.gutter,
                gap: 8,
                minWidth: 180,
              })}
            >
              <ThemedText variant="bodySm" color="primary">
                {plan.title[lang]}
              </ThemedText>
              <View
                style={{
                  height: 3,
                  borderRadius: radius.full,
                  backgroundColor: colors.surfaceContainerHigh,
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    width: `${(done / plan.days.length) * 100}%`,
                    height: '100%',
                    backgroundColor: colors.sage,
                    borderRadius: radius.full,
                  }}
                />
              </View>
              <ThemedText variant="labelSm" color="onSurfaceVariant">
                {done}/{plan.days.length} · {t('day', lang)}s
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
