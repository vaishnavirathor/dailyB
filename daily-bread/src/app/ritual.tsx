import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { CloseIcon, CrossIcon } from '@/components/icons';
import { ThemedText } from '@/components/themed-text';
import { getContentRepository } from '@/content/bundled';
import { t, type StringKey } from '@/i18n';
import { isTtsAvailable } from '@/services/tts';
import { smartSpeak, stopAllVoice } from '@/services/voice';
import { useProgress } from '@/stores/progress';
import { useLanguage } from '@/stores/settings';
import { colors, fonts, radius, spacing } from '@/theme';

interface Slide {
  kicker: StringKey;
  text: string;
  reference?: string;
  title?: string;
}

/** Reading-time fallback when TTS is unavailable: gentle, never rushed. */
function readMillis(text: string): number {
  return Math.min(40_000, Math.max(9_000, text.length * 65));
}

/**
 * The Morning Ritual — the whole daily loop as auto-advancing,
 * TTS-narrated slides: verse → promise → reflection → prayer. One tap
 * starts it; Amen closes it (and records the day's flags).
 */
export default function RitualScreen() {
  const router = useRouter();
  const lang = useLanguage();
  const insets = useSafeAreaInsets();
  const todayKey = useProgress((s) => s.todayKey);

  const repo = getContentRepository();
  const verse = repo.verseFor(todayKey);
  const promise = repo.promiseFor(todayKey);
  const reflection = repo.reflectionFor(todayKey);

  const slides: Slide[] = [
    { kicker: 'verseOfTheDay', text: verse.text[lang], reference: verse.reference[lang] },
    { kicker: 'dailyPromise', text: promise.text[lang], reference: promise.reference[lang] },
    { kicker: 'reflection', title: reflection.title[lang], text: reflection.body[lang] },
    { kicker: 'guidedPrayerTitle', text: reflection.prayer[lang] },
  ];

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [tts, setTts] = useState<boolean | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    void isTtsAvailable(lang).then(setTts);
  }, [lang]);

  const clearTimer = () => {
    if (timer.current !== null) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  const advance = useCallback(() => {
    clearTimer();
    stopAllVoice();
    setIndex((current) => Math.min(current + 1, slides.length - 1));
  }, [slides.length]);

  // Narrate (or time) the current slide; advance when it ends.
  useEffect(() => {
    if (paused || tts === null) {
      return;
    }
    const slide = slides[index];
    const last = index === slides.length - 1;
    const onDone = () => {
      if (!last) {
        timer.current = setTimeout(() => setIndex((c) => Math.min(c + 1, slides.length - 1)), 1400);
      }
    };
    if (tts) {
      const narration = [slide.title, slide.text, slide.reference].filter(Boolean).join('. ');
      void smartSpeak(narration, lang, { onDone, onError: onDone });
    } else if (!last) {
      timer.current = setTimeout(onDone, readMillis(slide.text));
    }
    return () => {
      clearTimer();
      stopAllVoice();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, paused, tts, lang]);

  const close = useCallback(() => {
    clearTimer();
    stopAllVoice();
    if (router.canGoBack()) {
      router.back();
    }
  }, [router]);

  const amen = () => {
    const progress = useProgress.getState();
    void progress.recordReflectionRead();
    void progress.recordPrayed();
    close();
  };

  const slide = slides[index];
  const isLast = index === slides.length - 1;
  const isTelugu = lang === 'te';

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.surface,
        paddingTop: insets.top + spacing.stackSm,
        paddingBottom: insets.bottom + spacing.stackMd,
        paddingHorizontal: spacing.containerMargin + 4,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={{
                width: i === index ? 22 : 8,
                height: 8,
                borderRadius: radius.full,
                backgroundColor: i <= index ? colors.gold : colors.surfaceContainerHighest,
              }}
            />
          ))}
        </View>
        <Pressable accessibilityRole="button" onPress={close} hitSlop={12}>
          <CloseIcon color={colors.primary} />
        </Pressable>
      </View>

      <Animated.View
        key={index}
        entering={FadeIn.duration(500)}
        exiting={FadeOut.duration(250)}
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.stackMd }}
      >
        <CrossIcon size={30} color={colors.gold} />
        <ThemedText
          variant="labelSm"
          color="secondary"
          style={{ textTransform: 'uppercase', letterSpacing: 3 }}
        >
          {t(slide.kicker, lang)}
        </ThemedText>
        {slide.title ? (
          <ThemedText variant="headlineSm" color="primary" align="center">
            {slide.title}
          </ThemedText>
        ) : null}
        <ThemedText
          align="center"
          style={{
            fontFamily: isTelugu ? fonts.teluguRegular : fonts.serifItalic,
            fontSize: slide.text.length > 220 ? 18 : 22,
            lineHeight: (slide.text.length > 220 ? 18 : 22) * (isTelugu ? 1.8 : 1.55),
            color: colors.primary,
          }}
        >
          {slide.text}
        </ThemedText>
        {slide.reference ? (
          <ThemedText
            variant="labelMd"
            color="onSurfaceVariant"
            style={{ letterSpacing: 2, textTransform: 'uppercase' }}
          >
            {slide.reference}
          </ThemedText>
        ) : null}
      </Animated.View>

      <View style={{ gap: spacing.stackSm }}>
        {isLast ? (
          <Button label={`🙏 ${t('amen', lang)}`} onPress={amen} />
        ) : (
          <View style={{ flexDirection: 'row', gap: spacing.stackSm }}>
            <Button
              label={paused ? t('resume', lang) : t('pause', lang)}
              variant="secondary"
              onPress={() => setPaused((p) => !p)}
              style={{ flex: 1 }}
            />
            <Button label={t('next', lang)} variant="secondary" onPress={advance} style={{ flex: 1 }} />
          </View>
        )}
      </View>
    </View>
  );
}
