import { Stack, useFocusEffect, useLocalSearchParams, usePathname, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { bibleBook, bookText, type BibleBook, type BibleVersion } from '@/bible/books';
import { BackButton } from '@/components/back-button';
import { BookmarkIcon, ChevronLeftIcon, ChevronRightIcon, PlayIcon, StopIcon } from '@/components/icons';
import { ThemedText } from '@/components/themed-text';
import {
  cycleHighlight,
  highlightsFor,
  isBookmarked,
  toggleBookmark,
  type HighlightColor,
} from '@/data/bible-marks';
import { toggleFavorite } from '@/data/favorites';
import { setLastRead } from '@/data/kv';
import { isTtsAvailable } from '@/services/tts';
import { smartSequence } from '@/services/voice';
import { trackChapterOpen } from '@/services/app-tracking';
import { t } from '@/i18n';
import { useBibleNav } from '@/stores/bible-navigation';
import { fontScaleFactor, useLanguage, useSettings } from '@/stores/settings';
import { colors, fonts, radius, spacing } from '@/theme';

const HIGHLIGHT_FILL: Record<HighlightColor, string> = {
  sage: 'rgba(90,96,67,0.14)',
  gold: 'rgba(233,195,73,0.22)',
};

const PAGE_BG = '#fdfbf4';
const SIDE_INSET = 10;

interface PendingTurn {
  dir: 1 | -1;
  chapter: number;
}

/**
 * The chapter reader as a horizontally-swipeable pager with a simple
 * slide animation. Each chapter is a scrollable list of verses, and
 * swiping left/right slides between chapters. The vertical ScrollView
 * is inside an Animated.View that translates horizontally during a
 * page turn, keeping the chrome fixed.
 *
 * Because the pan gesture only activates on horizontal offset (≥16px)
 * and fails on vertical offset (≥12px), the ScrollView's own vertical
 * scrolling wins on up/down drags, making the page feel like a real
 * scrollable document.
 */
export default function ChapterScreen() {
  const { book: bookId, chapter: chapterParam, v } = useLocalSearchParams<{
    book: string;
    chapter: string;
    v?: string;
  }>();
  const router = useRouter();
  const lang = useLanguage();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const reducedMotion = useReducedMotion();
  const fontScale = useSettings((s) => s.fontScale);
  const scale = fontScaleFactor[fontScale];

  const version: BibleVersion = v === 'en-kjv' ? 'en-kjv' : 'te-ov';
  const book = bibleBook(bookId);
  const pathname = usePathname();

  const [chapter, setChapter] = useState(() => Number(chapterParam) || 0);
  const [pending, setPending] = useState<PendingTurn | null>(null);
  const [marks, setMarks] = useState<Map<number, HighlightColor>>(new Map());
  const [bookmarked, setBookmarked] = useState(false);
  const [hintDismissed, setHintDismissed] = useState(false);

  const [readingIndex, setReadingIndex] = useState<number | null>(null);
  const [playFromIndex, setPlayFromIndex] = useState<number | null>(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const [ttsOk, setTtsOk] = useState(false);
  const stopReadingRef = useRef<(() => void) | null>(null);

  const stopReading = useCallback(() => {
    stopReadingRef.current?.();
    stopReadingRef.current = null;
    setReadingIndex(null);
    setPlayFromIndex(null);
    setAudioLoading(false);
  }, []);

  // Slide position: 0 = current chapter centered, ±1 = off-screen.
  const translateX = useSharedValue(0);
  const dirSV = useSharedValue<1 | -1>(1);
  const began = useSharedValue(0);
  const edge = useSharedValue(0);

  const chapterCount = book?.chapters ?? 0;
  const canTurn = (dir: 1 | -1) => (dir === 1 ? chapter < chapterCount - 1 : chapter > 0);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      trackChapterOpen(version, bookId, chapter, 'en');
      void setLastRead({ bookId, chapter, version });
      void Promise.all([
        highlightsFor(version, bookId, chapter),
        isBookmarked(version, bookId, chapter),
        isTtsAvailable(version === 'en-kjv' ? 'en' : 'te'),
      ]).then(([highlights, marked, tts]) => {
        if (active) {
          setMarks(highlights);
          setBookmarked(marked);
          setTtsOk(tts);
        }
      });
      return () => {
        active = false;
        stopReading();
      };
    }, [version, bookId, chapter, stopReading]),
  );

  useFocusEffect(
    useCallback(() => {
      useBibleNav.getState().setBibleSession(pathname);
      return () => {
        useBibleNav.getState().clearBibleSession();
      };
    }, [pathname]),
  );

  useEffect(() => {
    if (pending !== null) {
      stopReadingRef.current?.();
      stopReadingRef.current = null;
    }
  }, [pending]);

  // After chapter state commits from a page turn, reset the slide
  // position so the new chapter appears at center without a flash.
  useEffect(() => {
    translateX.set(0);
  }, [chapter, translateX]);

  const beginTurn = useCallback((dir: 1 | -1, target: number) => {
    setReadingIndex(null);
    setPlayFromIndex(null);
    setPending({ dir, chapter: target });
    if (!hintDismissed) setHintDismissed(true);
  }, [hintDismissed]);

  const commitTurn = useCallback(() => {
    setPending((current) => {
      if (current) {
        setChapter(current.chapter);
      }
      return null;
    });
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
  }, []);

  const cancelTurn = useCallback(() => {
    setPending(null);
    translateX.set(0);
  }, [translateX]);

  const pan = Gesture.Pan()
    .activeOffsetX([-16, 16])
    .failOffsetY([-12, 12])
    .onUpdate((event) => {
      'worklet';
      if (began.get() === 0) {
        const dir: 1 | -1 = event.translationX < 0 ? 1 : -1;
        began.set(1);
        dirSV.set(dir);
        const target = chapter + dir;
        if (target < 0 || target >= chapterCount) {
          edge.set(1);
        } else {
          scheduleOnRN(beginTurn, dir, target);
        }
      }
      const raw = event.translationX * (edge.get() === 1 ? 0.12 : 1);
      translateX.set(raw);
    })
    .onEnd((event) => {
      'worklet';
      began.set(0);
      if (edge.get() === 1) {
        edge.set(0);
        translateX.set(withSpring(0, { damping: 16, stiffness: 200 }));
        return;
      }
      const threshold = screenWidth * 0.25;
      const flick = dirSV.get() === 1 ? event.velocityX < -500 : event.velocityX > 500;
      if (Math.abs(event.translationX) > threshold || flick) {
        const dest = dirSV.get() === 1 ? -screenWidth : screenWidth;
        translateX.set(
          withSpring(dest, { damping: 18, stiffness: 120, mass: 0.6, overshootClamping: true }, (done) => {
            if (done) scheduleOnRN(commitTurn);
          }),
        );
      } else {
        translateX.set(
          withSpring(0, { damping: 20, stiffness: 180 }, (done) => {
            if (done) scheduleOnRN(cancelTurn);
          }),
        );
      }
    })
    .onFinalize(() => {
      'worklet';
      began.set(0);
      edge.set(0);
    });

  /** Slide the current chapter panel horizontally. */
  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.get() }],
  }));

  if (!book) {
    return <View style={{ flex: 1, backgroundColor: colors.surface }} />;
  }

  const destChapter = pending ? pending.chapter : chapter;

  const playChapter = () => {
    if (readingIndex !== null || audioLoading) {
      stopReading();
      return;
    }
    const verses = bookText(version, book.id)[chapter] ?? [];
    const startFrom = playFromIndex ?? 0;
    setAudioLoading(true);
    stopReadingRef.current = smartSequence(verses.slice(startFrom), version === 'en-kjv' ? 'en' : 'te', {
      onIndex: (relativeIndex) => {
        setAudioLoading(false);
        setReadingIndex(startFrom + relativeIndex);
      },
      onDone: () => {
        setReadingIndex(null);
        setAudioLoading(false);
      },
    });
  };

  const turnByButton = (dir: 1 | -1) => {
    if (!canTurn(dir) || pending) return;
    setReadingIndex(null);
    setPlayFromIndex(null);
    dirSV.set(dir);
    setPending({ dir, chapter: chapter + dir });
    if (!hintDismissed) setHintDismissed(true);
    const dest = dir === 1 ? -screenWidth : screenWidth;
    translateX.set(
      withSpring(dest, { damping: 18, stiffness: 120, mass: 0.6, overshootClamping: true }, (done) => {
        if (done) scheduleOnRN(commitTurn);
      }),
    );
  };

  const tapVerse = async (index: number) => {
    setPlayFromIndex(index);
    const color = await cycleHighlight(version, book.id, chapter, index);
    setMarks((previous) => {
      const next = new Map(previous);
      if (color === null) {
        next.delete(index);
      } else {
        next.set(index, color);
      }
      return next;
    });
  };

  const showHint = !hintDismissed;
  const isFirstChapter = chapter === 0;
  const isLastChapter = chapter >= chapterCount - 1;

  return (
    <>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: true }} />
      <View style={{ flex: 1, backgroundColor: '#efeadd' }}>
        {/* Header */}
        <View
          style={{
            paddingTop: insets.top + spacing.stackSm,
            paddingHorizontal: spacing.containerMargin,
            paddingBottom: spacing.stackSm + 2,
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.gutter,
          }}
        >
          <BackButton />
          <View style={{ flex: 1, alignItems: 'center', gap: 1 }}>
            <ThemedText
              variant="labelMd"
              color="secondary"
              numberOfLines={1}
              style={{ textTransform: 'uppercase', letterSpacing: 2.4 }}
            >
              {version === 'en-kjv' ? book.name.en : book.name.te}
            </ThemedText>
            <ThemedText
              variant="labelSm"
              color="onSurfaceVariant"
              style={{ fontVariant: ['tabular-nums'], letterSpacing: 1.2 }}
            >
              {t('chapterWord', lang)} {chapter + 1}
            </ThemedText>
          </View>
          <Pressable
            accessibilityRole="button"
            hitSlop={12}
            onPress={() => {
              void toggleBookmark(version, book.id, chapter).then(setBookmarked);
            }}
          >
            <BookmarkIcon size={22} color={colors.navyMuted} filled={bookmarked} />
          </Pressable>
        </View>

        {/* Content area — a horizontal track holding current + incoming
            chapters. The GestureDetector is scoped to the inner track so
            vertical ScrollView gets priority via failOffsetY. */}
        <GestureDetector gesture={pan}>
          <View style={{ flex: 1, overflow: 'hidden' }}>
            {/* Incoming chapter sits behind the current one, fading in. */}
            <View
              pointerEvents="none"
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            >
              <ChapterPage
                key={`dest-${version}-${book.id}-${destChapter}`}
                book={book}
                version={version}
                chapter={destChapter}
                scale={scale}
                marks={destChapter === chapter ? marks : undefined}
              />
            </View>

            {/* Current chapter — slides away on gesture. Wrapped in a
                plain View to avoid Reanimated layout animation warnings
                on the transform-bearing Animated.View inside. */}
            <View style={{ flex: 1 }}>
              <Animated.View style={[{ flex: 1 }, panelStyle]}>
                <ChapterPage
                  key={`cur-${version}-${book.id}-${chapter}`}
                  book={book}
                  version={version}
                  chapter={chapter}
                  scale={scale}
                  marks={marks}
                  readingIndex={readingIndex}
                  playFromIndex={playFromIndex}
                  hint={
                    showHint && chapter === Number(chapterParam)
                      ? `${t('pageTurnHint', lang)} · ${t('tapVerseHint', lang)}`
                      : undefined
                  }
                  onTapVerse={pending ? undefined : tapVerse}
                  onLongPressVerse={
                    pending
                      ? undefined
                      : (index, verse) => {
                          void toggleFavorite('bible', `bible:${version}:${book.id}:${chapter}:${index}`, {
                            text: verse,
                            reference: `${book.name[lang]} ${chapter + 1}:${index + 1}`,
                          });
                        }
                  }
                />
              </Animated.View>
            </View>
          </View>
        </GestureDetector>

        {/* Footer */}
        <View
          style={{
            paddingHorizontal: spacing.containerMargin,
            paddingTop: spacing.stackSm - 8,
            paddingBottom: insets.bottom + 4,
            backgroundColor: '#efeadd',
            borderTopWidth: 1,
            borderTopColor: 'rgba(60,42,20,0.10)',
          }}
        >
          {/* Chapter progress strip */}
          <View pointerEvents="none" style={{ height: 2, justifyContent: 'center' }}>
            <View
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                height: 1,
                backgroundColor: 'rgba(60,42,20,0.10)',
                borderRadius: 1,
              }}
            />
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: spacing.stackSm - 6,
            }}
          >
            <Pressable
              accessibilityRole="button"
              disabled={!canTurn(-1)}
              hitSlop={14}
              onPress={() => turnByButton(-1)}
              style={{
                width: 40,
                height: 34,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: radius.full,
                backgroundColor: canTurn(-1) ? 'rgba(168,128,31,0.10)' : 'transparent',
                opacity: canTurn(-1) ? 1 : 0.3,
              }}
            >
              <ChevronLeftIcon size={18} color={colors.navyMuted} />
            </Pressable>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.gutter }}>
              {ttsOk ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={readingIndex !== null ? t('stop', lang) : t('readChapter', lang)}
                  onPress={playChapter}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    paddingHorizontal: 14,
                    height: 34,
                    borderRadius: radius.full,
                    backgroundColor:
                      readingIndex !== null
                        ? colors.sage
                        : audioLoading
                          ? 'rgba(168,128,31,0.20)'
                          : 'rgba(168,128,31,0.12)',
                  }}
                >
                  {audioLoading ? (
                    <ActivityIndicator size={13} color={colors.secondary} />
                  ) : readingIndex !== null ? (
                    <StopIcon size={13} color={colors.onPrimary} />
                  ) : (
                    <PlayIcon size={13} color={colors.secondary} />
                  )}
                  <ThemedText
                    variant="labelSm"
                    color={readingIndex !== null ? 'onPrimary' : 'secondary'}
                    style={{ letterSpacing: 1 }}
                  >
                    {audioLoading ? t('listen', lang) : readingIndex !== null ? t('stop', lang) : t('listen', lang)}
                  </ThemedText>
                </Pressable>
              ) : null}
              <ThemedText
                variant="labelMd"
                color="onSurfaceVariant"
                style={{ fontVariant: ['tabular-nums'], letterSpacing: 1.6, minWidth: 64, textAlign: 'center' }}
              >
                {chapter + 1} / {book.chapters}
              </ThemedText>
            </View>

            <Pressable
              accessibilityRole="button"
              disabled={!canTurn(1)}
              hitSlop={14}
              onPress={() => turnByButton(1)}
              style={{
                width: 40,
                height: 34,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: radius.full,
                backgroundColor: canTurn(1) ? 'rgba(168,128,31,0.10)' : 'transparent',
                opacity: canTurn(1) ? 1 : 0.3,
              }}
            >
              <ChevronRightIcon size={18} color={colors.navyMuted} />
            </Pressable>
          </View>

          <View style={{ alignItems: 'center', minHeight: 14, marginTop: 4 }}>
            {isFirstChapter ? (
              <ThemedText variant="labelSm" color="onSurfaceVariant" style={{ letterSpacing: 1.2, opacity: 0.7 }}>
                {t('beginningOfBook', lang)}
              </ThemedText>
            ) : isLastChapter ? (
              <ThemedText variant="labelSm" color="onSurfaceVariant" style={{ letterSpacing: 1.2, opacity: 0.7 }}>
                {t('endOfBook', lang)}
              </ThemedText>
            ) : null}
          </View>
        </View>
      </View>
    </>
  );
}

/** One paper-styled page with scrollable verses. */
function ChapterPage({
  book,
  version,
  chapter,
  scale,
  marks,
  readingIndex = null,
  playFromIndex = null,
  hint,
  onTapVerse,
  onLongPressVerse,
}: {
  book: BibleBook;
  version: BibleVersion;
  chapter: number;
  scale: number;
  marks?: Map<number, HighlightColor>;
  readingIndex?: number | null;
  playFromIndex?: number | null;
  hint?: string;
  onTapVerse?: (index: number) => Promise<void>;
  onLongPressVerse?: (index: number, verse: string) => void;
}) {
  const verses = bookText(version, book.id)[chapter] ?? [];
  const textLang = version === 'en-kjv' ? 'en' : 'te';
  const scrollRef = useRef<ScrollView>(null);
  const versePositions = useRef<Map<number, number>>(new Map());

  useEffect(() => {
    if (readingIndex !== null) {
      const y = versePositions.current.get(readingIndex);
      if (y !== undefined) {
        scrollRef.current?.scrollTo({ y: Math.max(0, y - 96), animated: true });
      }
    }
  }, [readingIndex]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: PAGE_BG,
        borderTopLeftRadius: 4,
        borderBottomLeftRadius: 4,
        borderTopRightRadius: radius.md,
        borderBottomRightRadius: radius.md,
        overflow: 'hidden',
        marginHorizontal: SIDE_INSET,
        marginVertical: 2,
        boxShadow: '0 4px 18px rgba(40,30,10,0.20)',
      }}
    >
      <LinearGradient
        colors={['rgba(40,30,10,0.10)', 'rgba(40,30,10,0)']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 16, zIndex: 1 }}
      />
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{
          paddingVertical: spacing.stackMd,
          paddingHorizontal: spacing.containerMargin + 4,
          gap: spacing.stackSm,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ alignItems: 'center', gap: 4, paddingBottom: spacing.stackSm }}>
          <ThemedText
            style={{
              fontFamily: fonts.serifBold,
              fontSize: 44,
              lineHeight: 54,
              color: 'rgba(3,22,50,0.14)',
            }}
          >
            {chapter + 1}
          </ThemedText>
          <View style={{ height: 1, alignSelf: 'stretch', backgroundColor: 'rgba(3,22,50,0.08)' }} />
          {hint ? (
            <ThemedText
              variant="labelSm"
              align="center"
              style={{ color: 'rgba(68,71,77,0.55)', paddingTop: 2 }}
            >
              {hint}
            </ThemedText>
          ) : null}
        </View>

        {verses.map((verse, index) => {
          const color = marks?.get(index);
          const isReading = readingIndex === index;
          const isPlayFrom = playFromIndex === index;
          return (
            <Pressable
              key={index}
              accessibilityRole="button"
              disabled={!onTapVerse}
              onPress={onTapVerse ? () => void onTapVerse(index) : undefined}
              onLongPress={onLongPressVerse ? () => onLongPressVerse(index, verse) : undefined}
              onLayout={(event) => {
                versePositions.current.set(index, event.nativeEvent.layout.y);
              }}
              style={{
                flexDirection: 'row',
                gap: spacing.stackSm,
                backgroundColor: isReading
                  ? 'rgba(233,195,73,0.16)'
                  : isPlayFrom
                    ? 'rgba(168,128,31,0.07)'
                    : color
                      ? HIGHLIGHT_FILL[color]
                      : 'transparent',
                borderRadius: color || isReading ? radius.base : 0,
                borderCurve: 'continuous',
                padding: color || isReading || isPlayFrom ? 6 : 0,
              }}
            >
              {isPlayFrom && (
                <View
                  style={{
                    position: 'absolute',
                    left: -4,
                    top: 6,
                    bottom: 6,
                    width: 3,
                    backgroundColor: colors.gold,
                    borderRadius: 2,
                  }}
                />
              )}
              <ThemedText
                variant="labelSm"
                color="onSurfaceVariant"
                style={{ marginTop: 6, minWidth: 22, fontVariant: ['tabular-nums'] }}
              >
                {index + 1}
              </ThemedText>
              <ThemedText
                variant="bodyLg"
                lang={textLang}
                color="onSurface"
                scale={scale}
                style={{ flex: 1, textAlign: textLang === 'en' ? 'justify' : 'left' }}
                selectable={!!onTapVerse}
              >
                {verse}
              </ThemedText>
            </Pressable>
          );
        })}
        <View style={{ height: spacing.stackLg }} />
      </ScrollView>
    </View>
  );
}
