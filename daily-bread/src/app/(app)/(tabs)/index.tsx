import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, ActivityIndicator, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';

import { Button } from '@/components/button';
import { FavoriteButton } from '@/components/favorite-button';
import { MenuButton } from '@/components/menu-button';
import { BellIcon, PlayIcon, SproutIcon, StopIcon, TypeIcon, CloseIcon } from '@/components/icons';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { VerseCard } from '@/components/verse-card';
import { getContentRepository } from '@/content/bundled';
import { addDays, dayOfWeek, fromDateKey } from '@/domain/dates';
import { t, weekdays, months } from '@/i18n';
import { isTtsAvailable } from '@/services/tts';
import { onStopAllVoice, smartSpeak, stopAllVoice } from '@/services/voice';
import { trackButtonTap, track, EventName } from '@/services/app-tracking';
import { useAuth } from '@/stores/auth';
import { useProgress } from '@/stores/progress';
import { useLanguage } from '@/stores/settings';
import { colors, fonts, radius, shadows, spacing, tints } from '@/theme';

import { PlanChips } from '@/features/today/plan-chips';

const CARD_PADDING = spacing.stackMd + 8;
const CARD_BORDER = 1;

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

  const verseSeen = activity.verseSeen;
  useEffect(() => {
    if (!verseSeen) {
      void useProgress.getState().recordVerseSeen();
    }
  }, [verseSeen, todayKey]);

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
  const insets = useSafeAreaInsets();

  const { isAuthenticated } = useAuth();
  const [showNudge, setShowNudge] = useState(!isAuthenticated);

  const enableNotifications = async () => {
    trackButtonTap('notification_nudge_enable', 'home');
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') return;
      await Notifications.scheduleNotificationAsync({
        content: {
          title: t('notificationTitle', lang),
          body: t('notificationBody', lang),
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 86400, repeats: true },
      });
      track(EventName.NOTIFICATION_NUDGE_TAP, {});
    } catch {}
    setShowNudge(false);
  };

  const dismissNudge = () => {
    trackButtonTap('notification_nudge_dismiss', 'home');
    track(EventName.NOTIFICATION_NUDGE_DISMISS, {});
    setShowNudge(false);
  };

  useFocusEffect(
    useCallback(() => {
      return () => {
        stopAllVoice();
      };
    }, []),
  );

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') {
        stopAllVoice();
      }
    });
    return () => sub.remove();
  }, []);

  return (
    <Screen gap={spacing.stackMd}>
      <View style={{ marginHorizontal: -spacing.containerMargin, marginTop: -(insets.top + 4) }}>
        <LinearGradient
          colors={['rgba(250,243,230,0.95)', 'rgba(250,249,245,0.9)', colors.surface]}
          locations={[0, 0.35, 0.65]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{
            paddingHorizontal: spacing.containerMargin,
            paddingTop: insets.top + spacing.stackSm,
            paddingBottom: spacing.stackMd,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <MenuButton />
            {streak.length > 0 ? <StreakPill length={streak.length} /> : null}
          </View>

          {showNudge ? (
            <View style={{
              flexDirection: 'row', alignItems: 'center',
              marginTop: spacing.stackSm,
              backgroundColor: tints.promise,
              borderRadius: radius.base,
              padding: spacing.gutter,
              gap: spacing.stackSm,
            }}>
              <BellIcon size={20} color={colors.gold} />
              <View style={{ flex: 1, gap: 2 }}>
                <ThemedText variant="labelSm" color="primary" style={{ fontWeight: '600' }}>
                  {t('notificationsNudgeTitle', lang)}
                </ThemedText>
                <ThemedText variant="bodySm" color="onSurfaceVariant">
                  {t('notificationsNudgeBody', lang)}
                </ThemedText>
              </View>
              <Pressable
                onPress={enableNotifications}
                style={{
                  paddingVertical: 6, paddingHorizontal: 12,
                  borderRadius: radius.full,
                  backgroundColor: colors.sage,
                }}
              >
                <ThemedText variant="labelSm" color="onPrimary" style={{ fontWeight: '600' }}>
                  {t('notificationsEnable', lang)}
                </ThemedText>
              </Pressable>
              <Pressable onPress={dismissNudge} hitSlop={8}>
                <CloseIcon size={16} color={colors.navyMuted} />
              </Pressable>
            </View>
          ) : null}

          <View style={{ flex: 1, gap: 2, marginTop: 8 }}>
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

          {graceYesterday ? (
            <View style={{ marginTop: spacing.stackSm }}>
              <ThemedText variant="labelSm" color="success">
                {t('graceDay', lang)}
              </ThemedText>
            </View>
          ) : null}

          <Pressable
            accessibilityRole="button"
            onPress={() => { trackButtonTap('morning_ritual', 'home'); router.push('/ritual'); }}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.gutter,
              marginTop: spacing.stackMd,
              backgroundColor: colors.surfaceContainerLowest,
              borderRadius: radius.xl,
              borderCurve: 'continuous',
              borderWidth: CARD_BORDER,
              borderColor: 'rgba(168,128,31,0.22)',
              padding: CARD_PADDING - 4,
              boxShadow: shadows.verse,
              opacity: pressed ? 0.93 : 1,
            })}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: radius.full,
                backgroundColor: colors.gold,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PlayIcon size={16} color={colors.onPrimary} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <ThemedText variant="bodyMd" color="primary" style={{ fontFamily: fonts.bodySemiBold }}>
                {t('morningRitual', lang)}
              </ThemedText>
              <ThemedText variant="labelSm" color="onSurfaceVariant">
                {lang === 'te'
                  ? '3 నిమిషాల మార్గదర్శిత ప్రార్థన'
                  : 'A 3‑minute guided prayer'}
              </ThemedText>
            </View>
          </Pressable>
        </LinearGradient>
      </View>

      <VerseCard
        kicker={t('verseOfTheDay', lang)}
        text={verse.text[lang]}
        reference={verse.reference[lang]}
        lang={lang}
        favorite={
          <FavoriteButton
            kind="verse"
            refId={verse.id}
            payload={{ text: verse.text[lang], reference: verse.reference[lang] }}
          />
        }
      >
        <ListenControl text={`${verse.text[lang]}. ${verse.reference[lang]}`} />
        <Pressable
          accessibilityRole="button"
          onPress={() => { trackButtonTap('large_text', 'home'); router.push('/reader'); }}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
        >
          <TypeIcon size={18} color={colors.secondary} />
          <ThemedText variant="labelMd" color="secondary">
            {t('largeText', lang)}
          </ThemedText>
        </Pressable>
      </VerseCard>

      <View style={{ alignItems: 'center', paddingVertical: spacing.stackSm - 8 }}>
        <View
          style={{
            width: 5,
            height: 5,
            borderRadius: radius.full,
            backgroundColor: 'rgba(168,128,31,0.3)',
          }}
        />
      </View>

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

      <View
        style={{
          backgroundColor: colors.surfaceContainerLowest,
          borderRadius: radius.xl,
          borderCurve: 'continuous',
          borderWidth: CARD_BORDER,
          borderColor: 'rgba(182,109,82,0.15)',
          padding: CARD_PADDING,
          gap: spacing.stackSm,
          boxShadow: shadows.verse,
        }}
      >
        <View style={{ gap: spacing.stackSm }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.stackSm }}>
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
      </View>

      <PlanChips />

      <Button
        label={activity.prayed ? `${t('amen', lang)}` : t('prayNow', lang)}
        onPress={() => { trackButtonTap('prayer', 'home'); router.push('/prayer'); }}
        style={{ marginTop: spacing.stackSm }}
      />
    </Screen>
  );
}

function StreakPill({ length }: { length: number }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: tints.dailyLoop,
        borderRadius: radius.full,
        paddingVertical: 4,
        paddingHorizontal: 8,
      }}
    >
      <SproutIcon size={12} color={colors.sage} />
      <ThemedText
        variant="labelSm"
        style={{ color: colors.sage, fontVariant: ['tabular-nums'] }}
      >
        {length}
      </ThemedText>
    </View>
  );
}

function ListenControl({ text }: { text: string }) {
  const lang = useLanguage();
  const [available, setAvailable] = useState<boolean | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
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
    };
  }, [lang]);

  useEffect(() => {
    const unsub = onStopAllVoice(() => {
      setPlaying(false);
      setLoading(false);
    });
    return unsub;
  }, []);

  if (available !== true) {
    return null;
  }

  const toggle = async () => {
    if (playing || loading) {
      stopAllVoice();
      return;
    }
    stopAllVoice();
    setLoading(true);
    setPlaying(true);
    await smartSpeak(text, lang, {
      onDone: () => { if (mounted.current) { setPlaying(false); setLoading(false); } },
      onError: () => { if (mounted.current) { setPlaying(false); setLoading(false); } },
    });
    if (mounted.current) setLoading(false);
  };

  return (
    <Pressable
      accessibilityRole="button"
      onPress={toggle}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
    >
      {loading ? (
        <ActivityIndicator size={14} color={colors.secondary} />
      ) : playing ? (
        <StopIcon size={18} color={colors.secondary} />
      ) : (
        <PlayIcon size={18} color={colors.secondary} />
      )}
      <ThemedText variant="labelMd" color="secondary" style={{ fontFamily: fonts.labelMedium }}>
        {loading ? t('listen', lang) : playing ? t('stop', lang) : t('listen', lang)}
      </ThemedText>
    </Pressable>
  );
}
