import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { bibleBooks, bibleVersion, type BibleVersion } from '@/bible/books';
import { Card } from '@/components/card';
import { ChevronRightIcon } from '@/components/icons';
import { Screen } from '@/components/screen';
import { ScreenHeader } from '@/components/screen-header';
import { ThemedText } from '@/components/themed-text';
import { t } from '@/i18n';
import { useLanguage } from '@/stores/settings';
import { colors, radius, spacing } from '@/theme';

/**
 * The 66-book canon for the chosen edition. Telugu OV lists Telugu-first;
 * the English edition lists English-first.
 */
export default function BookListScreen() {
  const { v } = useLocalSearchParams<{ v?: string }>();
  const router = useRouter();
  const lang = useLanguage();
  const [testament, setTestament] = useState<'old' | 'new'>('old');

  const version: BibleVersion = v === 'en-kjv' ? 'en-kjv' : 'te-ov';
  const info = bibleVersion(version);
  const englishFirst = version === 'en-kjv';
  const books = bibleBooks.filter((b) => b.testament === testament);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen gap={spacing.stackMd}>
        <ScreenHeader
          eyebrow={t('tabBible', lang)}
          title={info?.title[lang] ?? t('tabBible', lang)}
          subtitle={info?.subtitle[lang]}
        />

        <View style={{ flexDirection: 'row', gap: spacing.stackSm }}>
          {(['old', 'new'] as const).map((side) => {
            const active = testament === side;
            return (
              <Pressable
                key={side}
                accessibilityRole="button"
                onPress={() => setTestament(side)}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  paddingVertical: spacing.stackSm,
                  borderRadius: radius.base,
                  borderCurve: 'continuous',
                  borderWidth: 1,
                  borderColor: active ? colors.gold : colors.outlineVariant,
                  backgroundColor: active ? '#fffaf0' : colors.surfaceContainerLowest,
                }}
              >
                <ThemedText
                  variant="labelMd"
                  style={{ color: active ? colors.secondary : colors.onSurfaceVariant }}
                >
                  {t(side === 'old' ? 'oldTestament' : 'newTestament', lang)}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>

        <Card padding={0}>
          {books.map((book, index) => (
            <Pressable
              key={book.id}
              accessibilityRole="button"
              onPress={() =>
                router.push({ pathname: '/bible/[book]', params: { book: book.id, v: version } })
              }
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.gutter,
                paddingVertical: spacing.stackSm + 2,
                paddingHorizontal: spacing.gutter,
                borderTopWidth: index === 0 ? 0 : 1,
                borderTopColor: colors.surfaceContainerHigh,
              }}
            >
              <View style={{ flex: 1, gap: 2 }}>
                <ThemedText variant="bodyMd" color="primary" lang={englishFirst ? 'en' : 'te'}>
                  {englishFirst ? book.name.en : book.name.te}
                </ThemedText>
                <ThemedText variant="labelMd" color="onSurfaceVariant">
                  {englishFirst ? book.name.te : book.name.en} · {book.chapters}{' '}
                  {t('chaptersWord', lang)}
                </ThemedText>
              </View>
              <ChevronRightIcon size={18} color={colors.outline} />
            </Pressable>
          ))}
        </Card>
      </Screen>
    </>
  );
}
