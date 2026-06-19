import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

import { Card } from '@/components/card';
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/icons';
import { Screen } from '@/components/screen';
import { StreakHeatmap } from '@/features/calendar/streak-heatmap';
import { ScreenHeader } from '@/components/screen-header';
import { ThemedText } from '@/components/themed-text';
import { getContentRepository } from '@/content/bundled';
import type { FeastOccurrence } from '@/content/types';
import type { SeasonTint } from '@/domain/liturgical';
import { diffDays, fromDateKey, toDateKey, type DateKey } from '@/domain/dates';
import { months, t, weekdaysShort } from '@/i18n';
import { useProgress } from '@/stores/progress';
import { useLanguage, useSettings } from '@/stores/settings';
import { colors, radius, spacing, tints } from '@/theme';

/**
 * The Christian Calendar — denomination-aware. Minimalist grid: today
 * wears a soft gold underdot, the selected date a deep navy circle;
 * feasts carry a small accent dot. Liturgical traditions get a season
 * banner tinted from the palette. Below, the living part: upcoming feasts.
 */
export default function CalendarScreen() {
  const lang = useLanguage();
  const tradition = useSettings((s) => s.tradition);
  const todayKey = useProgress((s) => s.todayKey);
  const today = fromDateKey(todayKey);
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-based
  const [selected, setSelected] = useState<DateKey>(todayKey);

  const repo = getContentRepository();
  const feastsByDate = useMemo(() => {
    const map = new Map<DateKey, FeastOccurrence>();
    for (const feast of [
      ...repo.feastsForYear(year, tradition),
      ...repo.feastsForYear(year + 1, tradition),
    ]) {
      map.set(feast.date, feast);
    }
    return map;
  }, [repo, year, tradition]);

  const season = useMemo(
    () => repo.seasonFor(selected, tradition),
    [repo, selected, tradition],
  );

  const upcoming = useMemo(
    () =>
      [...feastsByDate.values()]
        .filter((f) => diffDays(todayKey, f.date) >= 0)
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 5),
    [feastsByDate, todayKey],
  );

  const goMonth = (delta: number) => {
    const next = new Date(year, month + delta, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth());
  };

  // Build the 7-column grid for the visible month.
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingBlanks = firstDay.getDay();
  const cells: (number | null)[] = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  const selectedFeast = feastsByDate.get(selected);

  return (
    <Screen gap={spacing.stackMd}>
      <ScreenHeader
        menu
        eyebrow={t('tabCalendar', lang)}
        title={`${months[lang][month]} ${year}`}
        accessory={
          <View style={{ flexDirection: 'row', gap: spacing.stackSm }}>
            <Pressable accessibilityRole="button" hitSlop={8} onPress={() => goMonth(-1)}>
              <ChevronLeftIcon color={colors.navyMuted} />
            </Pressable>
            <Pressable accessibilityRole="button" hitSlop={8} onPress={() => goMonth(1)}>
              <ChevronRightIcon color={colors.navyMuted} />
            </Pressable>
          </View>
        }
      />

      {/* Liturgical season banner — palette tints only, never loud. */}
      {season ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.stackSm,
            backgroundColor: seasonTintFill(season.tint),
            borderRadius: radius.base,
            borderCurve: 'continuous',
            paddingVertical: spacing.stackSm,
            paddingHorizontal: spacing.gutter,
          }}
        >
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: radius.full,
              backgroundColor: seasonTintDot(season.tint),
            }}
          />
          <ThemedText variant="labelMd" style={{ color: seasonTintText(season.tint), letterSpacing: 1.4 }}>
            {season.name[lang]}
          </ThemedText>
        </View>
      ) : null}

      <Card padding={spacing.gutter} style={{ gap: spacing.stackSm }}>
        <View style={{ flexDirection: 'row' }}>
          {weekdaysShort[lang].map((day, i) => (
            <View key={i} style={{ flex: 1, alignItems: 'center' }}>
              <ThemedText variant="labelSm" color="onSurfaceVariant">
                {day}
              </ThemedText>
            </View>
          ))}
        </View>
        {Array.from({ length: cells.length / 7 }, (_, row) => (
          <View key={row} style={{ flexDirection: 'row' }}>
            {cells.slice(row * 7, row * 7 + 7).map((day, col) => {
              if (day === null) {
                return <View key={col} style={{ flex: 1, aspectRatio: 1 }} />;
              }
              const key = toDateKey(new Date(year, month, day));
              const isToday = key === todayKey;
              const isSelected = key === selected;
              const feast = feastsByDate.get(key);
              return (
                <Pressable
                  key={col}
                  accessibilityRole="button"
                  onPress={() => setSelected(key)}
                  style={{ flex: 1, aspectRatio: 1, alignItems: 'center', justifyContent: 'center' }}
                >
                  <View
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: radius.full,
                      backgroundColor: isSelected ? colors.primary : 'transparent',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1,
                    }}
                  >
                    <ThemedText
                      variant="bodySm"
                      style={{
                        color: isSelected ? colors.onPrimary : colors.onSurface,
                        fontVariant: ['tabular-nums'],
                        lineHeight: 18,
                      }}
                    >
                      {day}
                    </ThemedText>
                    {/* gold underdot = today · accent dot = feast */}
                    <View
                      style={{
                        width: 4,
                        height: 4,
                        borderRadius: radius.full,
                        backgroundColor: isToday
                          ? colors.goldBright
                          : feast
                            ? feast.accent === 'gold'
                              ? 'rgba(168,128,31,0.55)'
                              : 'rgba(58,75,104,0.45)'
                            : 'transparent',
                      }}
                    />
                  </View>
                </Pressable>
              );
            })}
          </View>
        ))}
      </Card>

      {selectedFeast ? (
        <Card
          padding={spacing.gutter}
          style={{
            backgroundColor: selectedFeast.accent === 'gold' ? '#fffaf0' : colors.surfaceContainerLowest,
            borderColor:
              selectedFeast.accent === 'gold' ? 'rgba(168,128,31,0.35)' : colors.outlineVariant,
            gap: 4,
          }}
        >
          <ThemedText variant="labelSm" color="secondary" style={{ letterSpacing: 1.6 }}>
            {formatFeastDate(selectedFeast.date, lang)}
          </ThemedText>
          <ThemedText variant="headlineSm" color="primary">
            {selectedFeast.name[lang]}
          </ThemedText>
          {selectedFeast.readings ? (
            <ThemedText variant="bodySm" color="onSurfaceVariant" style={{ marginTop: 4 }}>
              📖 {selectedFeast.readings[lang]}
            </ThemedText>
          ) : null}
        </Card>
      ) : null}

      <StreakHeatmap year={year} month={month} />

      <View style={{ gap: spacing.stackSm }}>
        <ThemedText
          variant="labelMd"
          color="onSurfaceVariant"
          style={{ textTransform: 'uppercase', letterSpacing: 2.1 }}
        >
          {t('upcomingFeasts', lang)}
        </ThemedText>
        {upcoming.map((feast) => {
          const away = diffDays(todayKey, feast.date);
          return (
            <View
              key={`${feast.id}-${feast.date}`}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.gutter,
                paddingVertical: spacing.stackSm,
                borderBottomWidth: 1,
                borderBottomColor: colors.surfaceContainerHigh,
              }}
            >
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: radius.full,
                  backgroundColor: feast.accent === 'gold' ? colors.goldBright : tints.calendar,
                  borderWidth: feast.accent === 'gold' ? 0 : 1,
                  borderColor: colors.navyMuted,
                }}
              />
              <View style={{ flex: 1, gap: 2 }}>
                <ThemedText variant="bodyMd" color="primary">
                  {feast.name[lang]}
                </ThemedText>
                <ThemedText variant="labelMd" color="onSurfaceVariant">
                  {formatFeastDate(feast.date, lang)}
                </ThemedText>
              </View>
              <ThemedText variant="labelMd" color="onSurfaceVariant">
                {away === 0
                  ? t('today', lang)
                  : away === 1
                    ? t('tomorrow', lang)
                    : `${away} ${t('daysAway', lang)}`}
              </ThemedText>
            </View>
          );
        })}
      </View>
    </Screen>
  );
}

function formatFeastDate(date: DateKey, lang: 'te' | 'en'): string {
  const d = fromDateKey(date);
  const month = months[lang][d.getMonth()];
  return lang === 'te'
    ? `${d.getDate()} ${month} ${d.getFullYear()}`
    : `${month} ${d.getDate()}, ${d.getFullYear()}`;
}

/** Season banner tints — soft fills from the semantic palette. */
function seasonTintFill(tint: SeasonTint): string {
  return tint === 'navy'
    ? 'rgba(58,75,104,0.10)'
    : tint === 'gold'
      ? 'rgba(168,128,31,0.12)'
      : 'rgba(90,96,67,0.10)';
}

function seasonTintDot(tint: SeasonTint): string {
  return tint === 'navy' ? colors.navyMuted : tint === 'gold' ? colors.goldBright : colors.sage;
}

function seasonTintText(tint: SeasonTint): string {
  return tint === 'navy' ? colors.navyMuted : tint === 'gold' ? colors.secondary : colors.sage;
}
