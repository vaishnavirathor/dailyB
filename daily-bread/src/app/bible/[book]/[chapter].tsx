import { Stack, useFocusEffect, useLocalSearchParams, usePathname, useRouter } from 'expo-router';
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
import { t } from '@/i18n';
import { useBibleNav } from '@/stores/bible-navigation';
import { fontScaleFactor, useLanguage, useSettings } from '@/stores/settings';
import { colors, fonts, radius, spacing } from '@/theme';

const HIGHLIGHT_FILL: Record<HighlightColor, string> = {
  sage: 'rgba(90,96,67,0.14)',
  gold: 'rgba(233,195,73,0.22)',
};

const PAGE_BG = '#fdfbf4';

interface PendingTurn {
  dir: 1 | -1; // 1 = forward (next chapter), -1 = back
  chapter: number;
}

/**
 * The chapter reader as a real book leaf. Swipe horizontally and the
 * page rotates around the spine in 3D (perspective + transformOrigin at
 * the binding), darkening as it lifts, with the incoming chapter waiting
 * beneath; release past the threshold and it completes with your
 * momentum, or settles back like paper. Vertical verse scrolling always
 * wins (activeOffsetX/failOffsetY).
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

  // The committed chapter lives in state; page turns never navigate.
  const [chapter, setChapter] = useState(() => Number(chapterParam) || 0);
  const [pending, setPending] = useState<PendingTurn | null>(null);
  const [marks, setMarks] = useState<Map<number, HighlightColor>>(new Map());
  const [bookmarked, setBookmarked] = useState(false);

  // Read-aloud: which verse the voice is on, and how to stop it.
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

  // Gesture-driven turn progress (0 flat → 1 fully turned).
  const turn = useSharedValue(0);
  const dirSV = useSharedValue<1 | -1>(1);
  const turning = useSharedValue(0); // leaf angle applies only mid-turn
  const began = useSharedValue(0); // direction locked for this gesture
  const edge = useSharedValue(0); // rubber-band at first/last chapter

  useFocusEffect(
    useCallback(() => {
      let active = true;
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

  // A turn starting (gesture or button) silences the voice. The ref is
  // touched here — not in the gesture builder — to satisfy the compiler.
  useEffect(() => {
    if (pending !== null) {
      stopReadingRef.current?.();
      stopReadingRef.current = null;
    }
  }, [pending]);

  const beginTurn = useCallback((dir: 1 | -1, target: number) => {
    setReadingIndex(null);
    setPlayFromIndex(null);
    setPending({ dir, chapter: target });
  }, []);

  const commitTurn = useCallback(() => {
    setPending((current) => {
      if (current) {
        setChapter(current.chapter);
      }
      return null;
    });
    turning.set(0);
    turn.set(0);
  }, [turn, turning]);

  const cancelTurn = useCallback(() => {
    setPending(null);
    turning.set(0);
    turn.set(0);
  }, [turn, turning]);

  // Hooks below must run unconditionally; the !book early-return comes
  // after them (react-hooks/rules-of-hooks).
  const chapterCount = book?.chapters ?? 0;

  const canTurn = (dir: 1 | -1) => (dir === 1 ? chapter < chapterCount - 1 : chapter > 0);

  const pan = Gesture.Pan()
    .activeOffsetX([-18, 18])
    .failOffsetY([-14, 14])
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
          turning.set(1);
          scheduleOnRN(beginTurn, dir, target);
        }
      }
      const raw = Math.abs(event.translationX) / (screenWidth * 0.9);
      turn.set(Math.min(1, raw * (edge.get() === 1 ? 0.12 : 1)));
    })
    .onEnd((event) => {
      'worklet';
      began.set(0);
      if (edge.get() === 1) {
        edge.set(0);
        turn.set(withSpring(0, { damping: 16, stiffness: 200 }));
        return;
      }
      const flick =
        dirSV.get() === 1 ? event.velocityX < -800 : event.velocityX > 800;
      if (turn.get() > 0.38 || flick) {
        turn.set(
          withSpring(
            1,
            {
              damping: 18,
              stiffness: 95,
              mass: 0.65,
              velocity: Math.abs(event.velocityX) / (screenWidth * 0.9),
              overshootClamping: true,
            },
            (done) => {
              if (done) {
                scheduleOnRN(commitTurn);
              }
            },
          ),
        );
      } else {
        turn.set(
          withSpring(0, { damping: 20, stiffness: 200 }, (done) => {
            if (done) {
              scheduleOnRN(cancelTurn);
            }
          }),
        );
      }
    })
    .onFinalize(() => {
      'worklet';
      began.set(0);
      edge.set(0);
    });

  /** The turning leaf: rotates around the spine with perspective. */
  const leafStyle = useAnimatedStyle(() => {
    const p = turn.get();
    if (turning.get() === 0) {
      // Idle (or edge rubber-band): a gentle horizontal nudge only.
      return {
        transform: [{ translateX: -p * 26 * dirSV.get() }],
        opacity: 1,
      };
    }
    if (reducedMotion) {
      const fade = dirSV.get() === 1 ? 1 - p : p;
      return { transform: [], opacity: fade };
    }
    const angle = dirSV.get() === 1 ? -p * 88 : -(1 - p) * 88;
    return {
      transform: [{ perspective: 1600 }, { rotateY: `${angle}deg` }],
      opacity: 1,
    };
  });

  /** Lighting on the leaf as it lifts off the spread. */
  const leafShadeStyle = useAnimatedStyle(() => {
    const p = turn.get();
    if (turning.get() === 0) {
      return { opacity: 0 };
    }
    const lift = dirSV.get() === 1 ? p : 1 - p;
    return { opacity: lift * 0.42 };
  });

  /** The page beneath brightens as the leaf reveals it. */
  const baseShadeStyle = useAnimatedStyle(() => {
    const p = turn.get();
    if (turning.get() === 0) {
      return { opacity: 0 };
    }
    const covered = dirSV.get() === 1 ? 1 - p : p;
    return { opacity: 0.18 + covered * 0.3 };
  });

  if (!book) {
    return <View style={{ flex: 1, backgroundColor: colors.surface }} />;
  }

  // What each layer shows: the leaf is the page being turned; the base
  // is the page that ends up on top once the turn completes (or the
  // current page while turning back).
  const leafChapter = pending ? (pending.dir === 1 ? chapter : pending.chapter) : chapter;
  const baseChapter = pending ? (pending.dir === 1 ? pending.chapter : chapter) : chapter;

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
    if (!canTurn(dir) || pending) {
      return;
    }
    setReadingIndex(null);
    setPlayFromIndex(null);
    dirSV.set(dir);
    turning.set(1);
    setPending({ dir, chapter: chapter + dir });
    turn.set(
      withSpring(1, { damping: 18, stiffness: 80, mass: 0.7, overshootClamping: true }, (done) => {
        if (done) {
          scheduleOnRN(commitTurn);
        }
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

  return (
    <>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: true }} />
      <View style={{ flex: 1, backgroundColor: '#efeadd' }}>
        {/* Fixed chrome above the turning page — back · title · bookmark */}
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

        {/* The book spread */}
        <GestureDetector gesture={pan}>
          <View style={{ flex: 1 }}>
            {/* Page beneath (the destination of the turn) */}
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
              <ChapterPage
                key={`base-${version}-${book.id}-${baseChapter}`}
                book={book}
                version={version}
                chapter={baseChapter}
                scale={scale}
                marks={baseChapter === chapter ? marks : undefined}
              />
              <Animated.View
                pointerEvents="none"
                style={[
                  { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#2a2417' },
                  baseShadeStyle,
                ]}
              />
            </View>

            {/* The leaf being turned (interactive when at rest) */}
            <Animated.View
              style={[
                { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, transformOrigin: 'left center' },
                leafStyle,
              ]}
            >
              <ChapterPage
                key={`leaf-${version}-${book.id}-${leafChapter}`}
                book={book}
                version={version}
                chapter={leafChapter}
                scale={scale}
                marks={leafChapter === chapter ? marks : undefined}
                readingIndex={leafChapter === chapter ? readingIndex : null}
                playFromIndex={leafChapter === chapter ? playFromIndex : null}
                hint={`${t('pageTurnHint', lang)} · ${t('tapVerseHint', lang)}`}
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
              {/* Page lighting + fore-edge shadow while lifting */}
              <Animated.View
                pointerEvents="none"
                style={[
                  { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
                  leafShadeStyle,
                ]}
              >
                <LinearGradient
                  colors={['rgba(20,16,8,0.05)', 'rgba(20,16,8,0.45)']}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={{ flex: 1 }}
                />
              </Animated.View>
            </Animated.View>
          </View>
        </GestureDetector>

        {/* Fixed footer: quiet chapter navigation */}
        <View
          style={{
            paddingHorizontal: spacing.containerMargin,
            paddingTop: spacing.stackSm - 2,
            paddingBottom: insets.bottom + spacing.stackSm - 2,
            backgroundColor: '#efeadd',
            borderTopWidth: 1,
            borderTopColor: 'rgba(60,42,20,0.10)',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Pressable
            accessibilityRole="button"
            disabled={!canTurn(-1)}
            onPress={() => turnByButton(-1)}
            hitSlop={10}
            style={{ opacity: canTurn(-1) ? 1 : 0.25, padding: 4 }}
          >
            <ChevronLeftIcon size={20} color={colors.navyMuted} />
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
                  paddingHorizontal: 12,
                  height: 34,
                  borderRadius: radius.full,
                  backgroundColor: readingIndex !== null ? colors.sage : audioLoading ? 'rgba(168,128,31,0.20)' : 'rgba(168,128,31,0.12)',
                }}
              >
                {audioLoading ? (
                  <ActivityIndicator size={14} color={colors.secondary} />
                ) : readingIndex !== null ? (
                  <StopIcon size={14} color={colors.onPrimary} />
                ) : (
                  <PlayIcon size={14} color={colors.secondary} />
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
              style={{ fontVariant: ['tabular-nums'], letterSpacing: 1.6 }}
            >
              {chapter + 1} / {book.chapters}
            </ThemedText>
          </View>
          <Pressable
            accessibilityRole="button"
            disabled={!canTurn(1)}
            onPress={() => turnByButton(1)}
            hitSlop={10}
            style={{ opacity: canTurn(1) ? 1 : 0.25, padding: 4 }}
          >
            <ChevronRightIcon size={20} color={colors.navyMuted} />
          </Pressable>
        </View>
      </View>
    </>
  );
}

/** One paper page: spine shading, heading, verses. */
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
  /** Verse currently being read aloud — softly lit, auto-scrolled to. */
  readingIndex?: number | null;
  /** Verse tapped as the start point for read-aloud. */
  playFromIndex?: number | null;
  /** Faint helper line under the chapter rule (scrolls with the page). */
  hint?: string;
  onTapVerse?: (index: number) => Promise<void>;
  onLongPressVerse?: (index: number, verse: string) => void;
}) {
  const verses = bookText(version, book.id)[chapter] ?? [];
  const textLang = version === 'en-kjv' ? 'en' : 'te';

  // Follow the voice: remember each verse's y, scroll as it advances.
  const scrollRef = useRef<ScrollView>(null);
  const versePositions = useRef<Map<number, number>>(new Map());

  useEffect(() => {
    if (readingIndex !== null) {
      const y = versePositions.current.get(readingIndex);
      if (y !== undefined) {
        scrollRef.current?.scrollTo({ y: Math.max(0, y - 120), animated: true });
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
        marginHorizontal: 6,
        boxShadow: '0 3px 14px rgba(40,30,10,0.18)',
      }}
    >
      {/* Spine gutter shading — the page curves into the binding. */}
      <LinearGradient
        colors={['rgba(40,30,10,0.10)', 'rgba(40,30,10,0)']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 18, zIndex: 1 }}
      />
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{
          paddingVertical: spacing.stackMd,
          paddingLeft: spacing.containerMargin,
          paddingRight: spacing.containerMargin - 6,
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
          {/* Gentle hints live in the page flow and scroll away. */}
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
