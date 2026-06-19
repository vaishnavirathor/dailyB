import { Stack, useFocusEffect, useLocalSearchParams, usePathname, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  UIManager,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { bibleBooks, bibleVersion, type BibleVersion } from '@/bible/books';
import { Card } from '@/components/card';
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/icons';
import { TAB_BAR_CLEARANCE } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { t } from '@/i18n';
import { useBibleNav } from '@/stores/bible-navigation';
import { useLanguage } from '@/stores/settings';
import { colors, radius, spacing } from '@/theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const TESTAMENTS = ['old', 'new'] as const;
const HEADER_SCROLL = 40;

export default function BookListScreen() {
  const { v } = useLocalSearchParams<{ v?: string }>();
  const router = useRouter();
  const lang = useLanguage();
  const insets = useSafeAreaInsets();
  const [testament, setTestament] = useState<'old' | 'new'>('old');
  const [scrolled, setScrolled] = useState(false);
  const scrolledRef = useRef(false);
  const pathname = usePathname();

  useFocusEffect(
    useCallback(() => {
      useBibleNav.getState().setBibleSession(pathname);
      return () => {
        useBibleNav.getState().clearBibleSession();
      };
    }, [pathname]),
  );

  const version: BibleVersion = v === 'en-kjv' ? 'en-kjv' : 'te-ov';
  const info = bibleVersion(version);
  const englishFirst = version === 'en-kjv';
  const books = bibleBooks.filter((b) => b.testament === testament);

  const switchTestament = useCallback(
    (side: 'old' | 'new') => {
      if (side === testament) return;
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setTestament(side);
    },
    [testament],
  );

  const pillLeft = testament === 'old' ? 3 : '50%';
  const pillRight = testament === 'old' ? '50%' : 3;

  return (
    <>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: true }} />
      <View style={{ flex: 1, backgroundColor: colors.surface }}>
        <View
          style={{
            paddingTop: insets.top + 4,
            paddingHorizontal: spacing.containerMargin,
            paddingBottom: spacing.stackSm,
            backgroundColor: colors.surface,
            zIndex: 10,
            borderBottomWidth: scrolled ? 1 : 0,
            borderBottomColor: colors.surfaceContainerHigh,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              marginBottom: spacing.stackSm,
            }}
          >
            <Pressable
              accessibilityRole="button"
              hitSlop={8}
              onPress={() => router.back()}
              style={{ marginTop: 2, marginRight: spacing.gutter }}
            >
              <View
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  backgroundColor: scrolled
                    ? colors.surfaceContainerLowest
                    : colors.surfaceContainerHigh,
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: scrolled ? '0 1px 6px rgba(0,0,0,0.10)' : undefined,
                }}
              >
                <ChevronLeftIcon size={20} color={colors.primary} />
              </View>
            </Pressable>
            <View style={{ flex: 1, gap: 2, opacity: scrolled ? 0.85 : 1 }}>
              <ThemedText variant="headlineMd" color="primary">
                {info?.title[lang] ?? t('tabBible', lang)}
              </ThemedText>
              {info?.subtitle[lang] ? (
                <ThemedText variant="bodySm" color="onSurfaceVariant">
                  {info.subtitle[lang]}
                </ThemedText>
              ) : null}
            </View>
          </View>

          <View
            style={{
              flexDirection: 'row',
              backgroundColor: colors.surfaceContainerHigh,
              borderRadius: radius.full,
              padding: 3,
              position: 'relative',
            }}
          >
            <View
              style={{
                position: 'absolute',
                top: 3,
                bottom: 3,
                left: pillLeft,
                right: pillRight,
                backgroundColor: colors.surfaceContainerLowest,
                borderRadius: radius.full - 2,
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              }}
            />
            {TESTAMENTS.map((side) => {
              const active = testament === side;
              return (
                <Pressable
                  key={side}
                  accessibilityRole="button"
                  onPress={() => switchTestament(side)}
                  style={{ flex: 1, alignItems: 'center', paddingVertical: 10, zIndex: 1 }}
                >
                  <ThemedText
                    variant="labelMd"
                    style={{
                      color: active ? colors.secondary : colors.onSurfaceVariant,
                      fontWeight: active ? '600' : '400',
                    }}
                  >
                    {t(side === 'old' ? 'oldTestament' : 'newTestament', lang)}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>

        <ScrollView
          onScroll={(e) => {
            const next = e.nativeEvent.contentOffset.y > 2;
            if (next !== scrolledRef.current) {
              scrolledRef.current = next;
              setScrolled(next);
            }
          }}
          scrollEventThrottle={16}
          contentContainerStyle={{
            paddingHorizontal: spacing.containerMargin,
            paddingTop: spacing.stackSm,
            paddingBottom: TAB_BAR_CLEARANCE,
          }}
          showsVerticalScrollIndicator={false}
        >
          <Card padding={0}>
            {books.map((book, index) => (
              <Pressable
                key={book.id}
                accessibilityRole="button"
                onPress={() =>
                  router.push({ pathname: '/bible/[book]', params: { book: book.id, v: version } })
                }
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.gutter,
                  paddingVertical: spacing.stackSm + 2,
                  paddingHorizontal: spacing.gutter,
                  borderTopWidth: index === 0 ? 0 : 1,
                  borderTopColor: colors.surfaceContainerHigh,
                  opacity: pressed ? 0.5 : 1,
                })}
              >
                <View style={{ flex: 1, gap: 2 }}>
                  <ThemedText variant="bodyMd" color="primary" lang={englishFirst ? 'en' : 'te'}>
                    {englishFirst ? book.name.en : book.name.te}
                  </ThemedText>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <ThemedText variant="labelMd" color="onSurfaceVariant">
                      {englishFirst ? book.name.te : book.name.en}
                    </ThemedText>
                    <View
                      style={{
                        backgroundColor: colors.surfaceContainerHigh,
                        borderRadius: radius.full,
                        paddingHorizontal: 7,
                        paddingVertical: 1,
                      }}
                    >
                      <ThemedText
                        variant="labelSm"
                        color="onSurfaceVariant"
                        style={{ fontVariant: ['tabular-nums'], fontSize: 11 }}
                      >
                        {book.chapters}
                      </ThemedText>
                    </View>
                  </View>
                </View>
                <ChevronRightIcon size={18} color={colors.outline} />
              </Pressable>
            ))}
          </Card>
        </ScrollView>
      </View>
    </>
  );
}