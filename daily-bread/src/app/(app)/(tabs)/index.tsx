import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';

import { Button } from '@/components/button';
import { FavoriteButton } from '@/components/favorite-button';
import { MenuButton } from '@/components/menu-button';
import { PlayIcon, SproutIcon, StopIcon, TypeIcon } from '@/components/icons';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { VerseCard } from '@/components/verse-card';
import { getContentRepository } from '@/content/bundled';
import { addDays, dayOfWeek, fromDateKey } from '@/domain/dates';
import { t, weekdays, months } from '@/i18n';
import { isTtsAvailable } from '@/services/tts';
import { smartSpeak, stopAllVoice } from '@/services/voice';
import { useProgress } from '@/stores/progress';
import { useLanguage } from '@/stores/settings';
import { colors, fonts, radius, spacing, tints } from '@/theme';

import { PlanChips } from '@/features/today/plan-chips';

/** The daily loop: verse → promise → reflection → prayer, under 3 minutes. */
export default function TodayScreen() {
  const router = useRouter();
  const lang = useLanguage();
  const todayKey = useProgress((s) => s.todayKey);
  const streak = useProgress((s) => s.streak);
  const activity = useProgress((s) => s.activity);
  const pendingMilestone = useProgress((s) => s.pendingMilestone);

  const repo = getContentRepository();
  const { verse, promise, reflection } = useMemo(
    () => ({
      verse: repo.verseFor(todayKey),
      promise: repo.promiseFor(todayKey),
      reflection: repo.reflectionFor(todayKey),
    }),
    [repo, todayKey],
  );

  // Opening the day's verse is what counts toward the streak.
  const verseSeen = activity.verseSeen;
  useEffect(() => {
    if (!verseSeen) {
      void useProgress.getState().recordVerseSeen();
    }
  }, [verseSeen, todayKey]);

  // A reached milestone presents its celebration once, gently.
  useEffect(() => {
    if (pendingMilestone !== null) {
      router.push('/milestone');
    }
  }, [pendingMilestone, router]);

  const date = fromDateKey(todayKey);
  const weekday = weekdays[lang][dayOfWeek(todayKey)];
  const month = months[lang][date.getMonth()];
  const heading =
    lang === 'te'
      ? `${weekday}, ${date.getDate()} ${month}`
      : `${weekday}, ${month} ${date.getDate()}`;
  const graceYesterday = streak.graceDays[0] === addDays(todayKey, -1);

  return (
    <Screen gap={spacing.stackMd}>
      <MenuButton />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.gutter }}>
        <View style={{ flex: 1, gap: 4 }}>
          <ThemedText
            variant="labelMd"
            color="secondary"
            style={{ textTransform: 'uppercase', letterSpacing: 2.6 }}
          >
            {t('appName', lang)}
          </ThemedText>
          <ThemedText variant="headlineMd" color="primary">
            {heading}
          </ThemedText>
        </View>
        {streak.length > 0 ? <StreakPill length={streak.length} /> : null}
      </View>
      {graceYesterday ? (
        <ThemedText variant="bodySm" color="success">
          🌿 {t('graceDay', lang)}
        </ThemedText>
      ) : null}

      {/* One tap starts the whole guided loop. */}
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/ritual')}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          alignSelf: 'flex-start',
          gap: 8,
          backgroundColor: pressed ? 'rgba(168,128,31,0.16)' : 'rgba(168,128,31,0.10)',
          borderRadius: radius.full,
          paddingVertical: 8,
          paddingHorizontal: 14,
        })}
      >
        <PlayIcon size={14} color={colors.secondary} />
        <ThemedText variant="labelMd" color="secondary">
          {t('morningRitual', lang)}
        </ThemedText>
      </Pressable>

      <VerseCard
        kicker={t('verseOfTheDay', lang)}
        text={verse.text[lang]}
        reference={verse.reference[lang]}
        lang={lang}
      >
        <ListenControl text={`${verse.text[lang]}. ${verse.reference[lang]}`} />
        <FavoriteButton
          kind="verse"
          refId={verse.id}
          payload={{ text: verse.text[lang], reference: verse.reference[lang] }}
        />
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/reader')}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
        >
          <TypeIcon size={18} color={colors.secondary} />
          <ThemedText variant="labelMd" color="secondary">
            {t('largeText', lang)}
          </ThemedText>
        </Pressable>
      </VerseCard>

      <VerseCard
        kicker={t('dailyPromise', lang)}
        text={promise.text[lang]}
        reference={promise.reference[lang]}
        lang={lang}
        accent="gold"
      >
        <ListenControl text={`${promise.text[lang]}. ${promise.reference[lang]}`} />
        <FavoriteButton
          kind="promise"
          refId={promise.id}
          payload={{ text: promise.text[lang], reference: promise.reference[lang] }}
        />
      </VerseCard>

      <View style={{ gap: spacing.stackSm, marginTop: spacing.stackSm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.stackSm }}>
          {/* Clay drop accent — the reflection's quiet ornament. */}
          <View
            style={{
              width: 3,
              height: 22,
              borderRadius: radius.full,
              backgroundColor: colors.clay,
            }}
          />
          <ThemedText
            variant="labelMd"
            color="onSurfaceVariant"
            style={{ textTransform: 'uppercase', letterSpacing: 2.1, flex: 1 }}
          >
            {t('reflection', lang)}
          </ThemedText>
          <ListenControl text={`${reflection.title[lang]}. ${reflection.body[lang]}`} />
        </View>
        <ThemedText variant="headlineSm" color="primary">
          {reflection.title[lang]}
        </ThemedText>
        <ThemedText variant="bodyLg" color="onSurface">
          {reflection.body[lang]}
        </ThemedText>
      </View>

      <PlanChips />

      <Button
        label={activity.prayed ? `🙏 ${t('amen', lang)}` : t('prayNow', lang)}
        onPress={() => router.push('/prayer')}
        style={{ marginTop: spacing.stackSm }}
      />
    </Screen>
  );
}

function StreakPill({ length }: { length: number }) {
  const lang = useLanguage();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: tints.dailyLoop,
        borderRadius: radius.full,
        paddingVertical: 6,
        paddingHorizontal: 12,
      }}
    >
      <SproutIcon size={16} color={colors.sage} />
      <ThemedText
        variant="labelMd"
        style={{ color: colors.sage, fontVariant: ['tabular-nums'] }}
      >
        {length} {t('dayStreak', lang)}
      </ThemedText>
    </View>
  );
}

function ListenControl({ text }: { text: string }) {
  const lang = useLanguage();
  const [available, setAvailable] = useState<boolean | null>(null);
  const [playing, setPlaying] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    void isTtsAvailable(lang).then((ok) => {
      if (mounted.current) {
        setAvailable(ok);
      }
    });
    return () => {
      mounted.current = false;
      stopAllVoice();
    };
  }, [lang]);

  if (available !== true) {
    return null; // gate: no Telugu voice on this device → control hides
  }

  const toggle = async () => {
    if (playing) {
      stopAllVoice();
      setPlaying(false);
      return;
    }
    setPlaying(true);
    await smartSpeak(text, lang, {
      onDone: () => mounted.current && setPlaying(false),
      onError: () => mounted.current && setPlaying(false),
    });
  };

  return (
    <Pressable
      accessibilityRole="button"
      onPress={toggle}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
    >
      {playing ? (
        <StopIcon size={18} color={colors.secondary} />
      ) : (
        <PlayIcon size={18} color={colors.secondary} />
      )}
      <ThemedText variant="labelMd" color="secondary" style={{ fontFamily: fonts.labelMedium }}>
        {playing ? t('stop', lang) : t('listen', lang)}
      </ThemedText>
    </Pressable>
  );
}
