import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FavoriteButton } from '@/components/favorite-button';
import { ChevronRightIcon, SearchIcon } from '@/components/icons';
import { MenuButton } from '@/components/menu-button';
import { TAB_BAR_CLEARANCE } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { getContentRepository } from '@/content/bundled';
import type { Hymn } from '@/content/types';
import { t } from '@/i18n';
import { useLanguage } from '@/stores/settings';
import { colors, radius, spacing, textStyle } from '@/theme';

const HEADER_HEIGHT = 92;

/** Worship Lyrics — grouped by type, minimal rows, collapsible header. */
export default function LyricsListScreen() {
  const router = useRouter();
  const lang = useLanguage();
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);
  const [query, setQuery] = useState('');
  const allHymns = getContentRepository().hymns();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allHymns;
    return allHymns.filter(
      (h) =>
        h.title.te.toLowerCase().includes(q) ||
        h.title.en.toLowerCase().includes(q) ||
        h.stanzas.some((s) => s.te.toLowerCase().includes(q)),
    );
  }, [query, allHymns]);

  const grouped = useMemo(() => {
    const scripture = filtered.filter((h) => h.source === 'scripture');
    const original = filtered.filter((h) => h.source === 'original');
    const groups: { title: string; hymns: Hymn[] }[] = [];
    if (scripture.length) groups.push({ title: 'Scripture', hymns: scripture });
    if (original.length) groups.push({ title: 'Songs', hymns: original });
    return groups;
  }, [filtered]);

  const inputStyle = textStyle('bodyMd', lang);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const titleStyle = useAnimatedStyle(() => {
    const fontSize = interpolate(scrollY.value, [0, HEADER_HEIGHT], [28, 18], Extrapolation.CLAMP);
    const lineHeight = interpolate(scrollY.value, [0, HEADER_HEIGHT], [36, 24], Extrapolation.CLAMP);
    const opacity = interpolate(scrollY.value, [0, HEADER_HEIGHT * 0.5], [1, 0], Extrapolation.CLAMP);
    return { fontSize, lineHeight, opacity };
  });

  const eyebrowStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [0, 30], [1, 0], Extrapolation.CLAMP);
    return { opacity };
  });

  const headerContainerStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollY.value,
      [0, HEADER_HEIGHT],
      [HEADER_HEIGHT, 0],
      Extrapolation.CLAMP,
    );
    return { height, overflow: 'hidden' };
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <View
        style={{
          paddingTop: insets.top + 4,
          paddingHorizontal: spacing.containerMargin,
          backgroundColor: colors.surface,
          zIndex: 10,
        }}
      >
        <Animated.View style={headerContainerStyle}>
          <View style={{ paddingVertical: spacing.stackSm - 4 }}>
            <MenuButton />
            <Animated.View style={eyebrowStyle}>
              <ThemedText
                variant="labelMd"
                color="secondary"
                style={{ textTransform: 'uppercase', letterSpacing: 2.6 }}
              >
                {t('sectionLibrary', lang)}
              </ThemedText>
            </Animated.View>
            <Animated.Text
              style={[
                {
                  fontFamily: textStyle('headlineMd', lang).fontFamily,
                  color: colors.primary,
                },
                titleStyle,
              ]}
            >
              {t('lyrics', lang)}
            </Animated.Text>
          </View>
        </Animated.View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.surfaceContainerLow,
            borderRadius: radius.lg,
            borderCurve: 'continuous',
            paddingHorizontal: spacing.gutter,
            gap: spacing.stackSm,
            height: 48,
            marginBottom: spacing.stackMd,
          }}
        >
          <SearchIcon size={18} color={colors.outline} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t('searchLyrics', lang)}
            placeholderTextColor={colors.outline}
            style={{
              flex: 1,
              fontFamily: inputStyle.fontFamily,
              fontSize: inputStyle.fontSize,
              lineHeight: inputStyle.lineHeight,
              color: colors.onSurface,
              paddingVertical: 0,
            }}
          />
        </View>
      </View>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingHorizontal: spacing.containerMargin,
          paddingBottom: TAB_BAR_CLEARANCE,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {grouped.map((section) => (
          <View key={section.title} style={{ marginBottom: spacing.stackLg }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.stackSm,
                marginBottom: spacing.stackSm,
                paddingHorizontal: 4,
              }}
            >
              <View
                style={{
                  width: 3,
                  height: 16,
                  borderRadius: 2,
                  backgroundColor: section.title === 'Scripture' ? colors.gold : colors.sage,
                }}
              />
              <ThemedText
                variant="labelMd"
                color="secondary"
                style={{ textTransform: 'uppercase', letterSpacing: 1.8 }}
              >
                {section.title}
              </ThemedText>
              <View
                style={{
                  flex: 1,
                  height: 1,
                  backgroundColor: 'rgba(0,0,0,0.06)',
                }}
              />
              <ThemedText variant="labelSm" color="onSurfaceVariant">
                {section.hymns.length}
              </ThemedText>
            </View>

            {section.hymns.map((hymn) => (
              <Pressable
                key={hymn.id}
                accessibilityRole="button"
                onPress={() => router.push({ pathname: '/lyrics/[id]', params: { id: hymn.id } })}
                style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.gutter,
                    paddingVertical: spacing.stackSm + 2,
                    paddingHorizontal: 4,
                  }}
                >
                  <View style={{ flex: 1, gap: 3 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.stackSm }}>
                      <ThemedText
                        variant="bodyMd"
                        color="primary"
                        lang="te"
                        numberOfLines={1}
                        style={{ fontWeight: '600', flex: 1 }}
                      >
                        {hymn.title.te}
                      </ThemedText>
                      <View
                        style={{
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                          borderRadius: 20,
                          backgroundColor:
                            hymn.source === 'scripture'
                              ? 'rgba(168,128,31,0.12)'
                              : 'rgba(90,96,67,0.1)',
                        }}
                      >
                        <ThemedText
                          variant="labelSm"
                          style={{
                            color:
                              hymn.source === 'scripture' ? colors.gold : colors.sage,
                            letterSpacing: 0.5,
                          }}
                        >
                          {hymn.source === 'scripture'
                            ? t('scriptureSong', lang)
                            : 'Song'}
                        </ThemedText>
                      </View>
                    </View>
                    <ThemedText variant="bodySm" color="onSurfaceVariant" numberOfLines={1}>
                      {hymn.title.en}
                      {hymn.reference ? ` · ${hymn.reference[lang]}` : ''}
                    </ThemedText>
                  </View>

                  <FavoriteButton
                    kind="hymn"
                    refId={hymn.id}
                    payload={{
                      text: hymn.stanzas[0]?.te ?? hymn.title.te,
                      reference: hymn.title[lang],
                    }}
                    size={18}
                  />

                  <ChevronRightIcon size={14} color={colors.outline} />
                </View>
              </Pressable>
            ))}
          </View>
        ))}
      </Animated.ScrollView>
    </View>
  );
}
