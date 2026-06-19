import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { View } from 'react-native';

import { Card } from '@/components/card';
import { SproutIcon } from '@/components/icons';
import { ThemedText } from '@/components/themed-text';
import { completedDates } from '@/data/activity';
import { toDateKey, type DateKey } from '@/domain/dates';
import { bestStreak } from '@/domain/streaks';
import { t } from '@/i18n';
import { useProgress } from '@/stores/progress';
import { useLanguage } from '@/stores/settings';
import { colors, radius, spacing } from '@/theme';

/**
 * Gentle progress visibility: the visible month as a dot heatmap (sage =
 * read, gold ring = grace day, outline = today) and three quiet totals.
 * Progress-forward — no red, no guilt.
 */
export function StreakHeatmap({ year, month }: { year: number; month: number }) {
  const lang = useLanguage();
  const todayKey = useProgress((s) => s.todayKey);
  const streak = useProgress((s) => s.streak);
  const [completed, setCompleted] = useState<Set<DateKey>>(new Set());

  useFocusEffect(
    useCallback(() => {
      let active = true;
      void completedDates().then((dates) => {
        if (active) {
          setCompleted(dates);
        }
      });
      return () => {
        active = false;
      };
    }, []),
  );

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const grace = new Set(streak.graceDays);
  const best = Math.max(bestStreak(completed), streak.length);

  return (
    <Card padding={spacing.gutter} style={{ gap: spacing.stackSm }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.stackSm }}>
        <SproutIcon size={18} color={colors.sage} />
        <ThemedText
          variant="labelMd"
          color="onSurfaceVariant"
          style={{ textTransform: 'uppercase', letterSpacing: 2.1 }}
        >
          {t('dayStreak', lang)}
        </ThemedText>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
        {Array.from({ length: daysInMonth }, (_, i) => {
          const key = toDateKey(new Date(year, month, i + 1));
          const done = completed.has(key);
          const isGrace = grace.has(key);
          const isToday = key === todayKey;
          return (
            <View
              key={i}
              style={{
                width: 16,
                height: 16,
                borderRadius: radius.full,
                backgroundColor: done ? colors.sage : colors.surfaceContainerHigh,
                borderWidth: isToday ? 2 : isGrace ? 2 : 0,
                borderColor: isToday ? colors.primary : colors.goldBright,
              }}
            />
          );
        })}
      </View>

      <View style={{ flexDirection: 'row', gap: spacing.stackLg, marginTop: 4 }}>
        <Stat value={streak.length} label={lang === 'te' ? 'ప్రస్తుతం' : 'current'} />
        <Stat value={best} label={lang === 'te' ? 'అత్యుత్తమం' : 'best'} />
        <Stat value={completed.size} label={lang === 'te' ? 'మొత్తం రోజులు' : 'total days'} />
      </View>
    </Card>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View style={{ gap: 1 }}>
      <ThemedText
        variant="headlineSm"
        color="primary"
        style={{ fontVariant: ['tabular-nums'] }}
      >
        {value}
      </ThemedText>
      <ThemedText variant="labelSm" color="onSurfaceVariant">
        {label}
      </ThemedText>
    </View>
  );
}
