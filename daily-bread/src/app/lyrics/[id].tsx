import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, useWindowDimensions, View } from 'react-native';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FavoriteButton } from '@/components/favorite-button';
import { ChevronLeftIcon } from '@/components/icons';
import { ThemedText } from '@/components/themed-text';
import { getContentRepository } from '@/content/bundled';
import { t } from '@/i18n';
import { fontScaleFactor, useLanguage, useSettings } from '@/stores/settings';
import { colors, radius, spacing } from '@/theme';

const HEADER_MAX = 240;
const HEADER_MIN = 80;
const HEADER_DIFF = HEADER_MAX - HEADER_MIN;

/**
 * Hymn detail — minimal hero, scrollable stanzas with active highlighting.
 */
export default function HymnDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lang = useLanguage();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const fontScale = useSettings((s) => s.fontScale);
  const scale = fontScaleFactor[fontScale];
  const scrollY = useSharedValue(0);
  const hymn = getContentRepository().hymn(id);

  const stanzaPositions = useRef<{ y: number; height: number }[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const findActiveStanza = (offset: number) => {
    const viewCenter = offset + windowHeight * 0.45;
    let idx = 0;
    for (let i = 0; i < stanzaPositions.current.length; i++) {
      if (stanzaPositions.current[i].y <= viewCenter) {
        idx = i;
      }
    }
    setActiveIndex(idx);
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
      runOnJS(findActiveStanza)(event.contentOffset.y);
    },
  });

  const headerHeight = useAnimatedStyle(() => {
    const height = interpolate(scrollY.value, [0, HEADER_DIFF], [HEADER_MAX, HEADER_MIN], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    return { height };
  });

  const headerContentOpacity = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [0, HEADER_DIFF * 0.7], [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    return { opacity };
  });

  const miniHeaderOpacity = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [HEADER_DIFF * 0.4, HEADER_DIFF], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    return { opacity };
  });

  if (!hymn) {
    return <View style={{ flex: 1, backgroundColor: colors.surface }} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      {/* Floating nav bar */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 20,
          paddingTop: insets.top + 8,
          paddingHorizontal: spacing.containerMargin,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.stackSm,
        }}
      >
        <Pressable
          accessibilityRole="button"
          hitSlop={10}
          onPress={() => navigation.goBack()}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        >
          <ChevronLeftIcon size={24} color={colors.inverseOnSurface} />
        </Pressable>

        <View style={{ flex: 1 }}>
          <Animated.View style={miniHeaderOpacity}>
            <ThemedText variant="bodyMd" color="onSurface" lang="te" numberOfLines={1}>
              {hymn.title.te}
            </ThemedText>
          </Animated.View>
        </View>

        <FavoriteButton
          kind="hymn"
          refId={hymn.id}
          payload={{
            text: hymn.stanzas[0]?.te ?? hymn.title.te,
            reference: hymn.title[lang],
          }}
          size={24}
        />
      </View>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.stackXl }}
      >
        {/* Hero */}
        <Animated.View style={[{ overflow: 'hidden' }, headerHeight]}>
          <LinearGradient
            colors={['#1a2b48', '#031632', '#0a0a0a']}
            locations={[0, 0.5, 1]}
            style={{
              flex: 1,
              justifyContent: 'flex-end',
              paddingHorizontal: spacing.containerMargin,
              paddingBottom: spacing.stackLg,
            }}
          >
            <Animated.View style={headerContentOpacity}>
              <ThemedText
                variant="displayLg"
                lang="te"
                style={{ color: '#ffffff', marginBottom: spacing.stackSm }}
              >
                {hymn.title.te}
              </ThemedText>

              <ThemedText variant="bodyMd" style={{ color: 'rgba(255,255,255,0.65)' }}>
                {hymn.title.en}
                {hymn.reference ? ` · ${hymn.reference[lang]}` : ''}
              </ThemedText>

              {hymn.source === 'scripture' ? (
                <View
                  style={{
                    alignSelf: 'flex-start',
                    marginTop: spacing.stackSm,
                    paddingHorizontal: 10,
                    paddingVertical: 3,
                    borderRadius: 20,
                    backgroundColor: 'rgba(168,128,31,0.2)',
                  }}
                >
                  <ThemedText
                    variant="labelSm"
                    style={{ color: 'rgba(255,255,255,0.8)', letterSpacing: 0.5 }}
                  >
                    {t('scriptureSong', lang)}
                  </ThemedText>
                </View>
              ) : null}
            </Animated.View>
          </LinearGradient>
        </Animated.View>

        {/* Stanzas */}
        <View style={{ paddingHorizontal: spacing.containerMargin, paddingTop: spacing.stackLg, gap: spacing.stackMd }}>
          {hymn.stanzas.map((stanza, index) => (
            <Pressable
              key={index}
              onLayout={(e) => {
                stanzaPositions.current[index] = {
                  y: e.nativeEvent.layout.y,
                  height: e.nativeEvent.layout.height,
                };
              }}
              style={({ pressed }) => ({
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Animated.View
                style={[
                  {
                    borderRadius: radius.md,
                    borderCurve: 'continuous',
                    overflow: 'hidden',
                    borderWidth: 1,
                    borderColor: activeIndex === index
                      ? stanza.isRefrain
                        ? 'rgba(90,96,67,0.5)'
                        : 'rgba(168,128,31,0.35)'
                      : stanza.isRefrain
                        ? 'rgba(90,96,67,0.18)'
                        : 'rgba(0,0,0,0.06)',
                    backgroundColor: activeIndex === index
                      ? 'rgba(255,255,255,0.95)'
                      : 'rgba(255,255,255,0.55)',
                    transform: [{ scale: activeIndex === index ? 1 : 0.98 }],
                    shadowColor: activeIndex === index ? '#000' : 'transparent',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: activeIndex === index ? 0.08 : 0,
                    shadowRadius: 8,
                    elevation: activeIndex === index ? 3 : 0,
                  },
                ]}
              >
                <View
                  style={{
                    gap: spacing.stackSm,
                    padding: spacing.gutter,
                    borderLeftWidth: 3,
                    borderLeftColor: stanza.isRefrain ? colors.sage : colors.gold,
                  }}
                >
                  {stanza.isRefrain ? (
                    <ThemedText
                      variant="labelSm"
                      style={{
                        color: colors.sage,
                        textTransform: 'uppercase',
                        letterSpacing: 1.6,
                      }}
                    >
                      {t('refrain', lang)}
                    </ThemedText>
                  ) : null}
                  <ThemedText variant="bodyLg" lang="te" color="primary" scale={scale} selectable>
                    {stanza.te}
                  </ThemedText>
                  <ThemedText
                    variant="bodySm"
                    lang="en"
                    color="onSurfaceVariant"
                    scale={scale}
                    style={{ fontStyle: 'italic' }}
                  >
                    {stanza.translit}
                  </ThemedText>
                </View>
              </Animated.View>
            </Pressable>
          ))}
        </View>
      </Animated.ScrollView>
    </View>
  );
}
