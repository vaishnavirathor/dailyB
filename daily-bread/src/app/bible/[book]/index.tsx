import { Stack, useFocusEffect, useLocalSearchParams, usePathname, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { bibleBook, bookText, type BibleVersion } from '@/bible/books';
import { Screen } from '@/components/screen';
import { ScreenHeader } from '@/components/screen-header';
import { ThemedText } from '@/components/themed-text';
import { t } from '@/i18n';
import { useBibleNav } from '@/stores/bible-navigation';
import { useLanguage, useSettings } from '@/stores/settings';
import { colors, radius, spacing, textStyle } from '@/theme';

interface SearchHit {
  chapter: number;
  verse: number;
  text: string;
}

/** Chapter grid + whole-book search. */
export default function BookScreen() {
  const { book: bookId, v } = useLocalSearchParams<{ book: string; v?: string }>();
  const router = useRouter();
  const lang = useLanguage();
  const englishHeadingFont = useSettings((s) => s.englishHeadingFont);
  const englishBodyFont = useSettings((s) => s.englishBodyFont);
  const [query, setQuery] = useState('');
  const pathname = usePathname();
  const book = bibleBook(bookId);

  useFocusEffect(
    useCallback(() => {
      useBibleNav.getState().setBibleSession(pathname);
      return () => {
        useBibleNav.getState().clearBibleSession();
      };
    }, [pathname]),
  );
  // Edition travels as ?v= (defaults to the Telugu OV).
  const version: BibleVersion = v === 'en-kjv' ? 'en-kjv' : 'te-ov';

  const hits = useMemo<SearchHit[]>(() => {
    const q = query.trim();
    if (!book || q.length < 2) {
      return [];
    }
    const text = bookText(version, book.id);
    const results: SearchHit[] = [];
    for (let c = 0; c < text.length && results.length < 40; c++) {
      for (let v = 0; v < text[c].length && results.length < 40; v++) {
        if (text[c][v].includes(q)) {
          results.push({ chapter: c, verse: v, text: text[c][v] });
        }
      }
    }
    return results;
  }, [book, query, version]);

  if (!book) {
    return (
      <Screen>
        <View />
      </Screen>
    );
  }

  const isEnglish = lang === 'en';
  const fontOverrides = isEnglish
    ? { heading: englishHeadingFont, body: englishBodyFont }
    : undefined;
  const inputStyle = textStyle('bodyMd', lang, fontOverrides);

  return (
    <>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: true }} />
      <Screen gap={spacing.stackMd}>
        <ScreenHeader
          back
          eyebrow={t('tabBible', lang)}
          title={book.name[lang]}
          subtitle={`${book.name[lang === 'te' ? 'en' : 'te']} · ${book.chapters} ${t('chaptersWord', lang)}`}
        />

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('searchInBook', lang)}
          placeholderTextColor={colors.outline}
          style={{
            fontFamily: inputStyle.fontFamily,
            fontSize: inputStyle.fontSize,
            lineHeight: inputStyle.lineHeight,
            color: colors.onSurface,
            borderBottomWidth: 1,
            borderBottomColor: colors.outlineVariant,
            paddingVertical: spacing.stackSm - 4,
          }}
        />

        {query.trim().length >= 2 ? (
          <View style={{ gap: spacing.stackSm }}>
            {hits.map((hit) => (
              <Pressable
                key={`${hit.chapter}-${hit.verse}`}
                accessibilityRole="button"
                onPress={() =>
                  router.push({
                    pathname: '/bible/[book]/[chapter]',
                    params: { book: book.id, chapter: String(hit.chapter), v: version },
                  })
                }
                style={{
                  backgroundColor: colors.surfaceContainerLowest,
                  borderWidth: 1,
                  borderColor: colors.outlineVariant,
                  borderRadius: radius.md,
                  borderCurve: 'continuous',
                  padding: spacing.gutter,
                  gap: 4,
                }}
              >
                <ThemedText variant="labelMd" color="secondary">
                  {book.name[lang]} {hit.chapter + 1}:{hit.verse + 1}
                </ThemedText>
                <ThemedText variant="bodySm" color="onSurface" numberOfLines={3} lang="te">
                  {hit.text}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.stackSm - 2 }}>
            {Array.from({ length: book.chapters }, (_, index) => (
              <Pressable
                key={index}
                accessibilityRole="button"
                onPress={() =>
                  router.push({
                    pathname: '/bible/[book]/[chapter]',
                    params: { book: book.id, chapter: String(index), v: version },
                  })
                }
                style={({ pressed }) => ({
                  width: 52,
                  height: 52,
                  borderRadius: radius.md,
                  borderCurve: 'continuous',
                  borderWidth: 1,
                  borderColor: pressed ? colors.gold : colors.outlineVariant,
                  backgroundColor: colors.surfaceContainerLowest,
                  alignItems: 'center',
                  justifyContent: 'center',
                })}
              >
                <ThemedText
                  variant="bodyMd"
                  color="primary"
                  style={{ fontVariant: ['tabular-nums'] }}
                >
                  {index + 1}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        )}
      </Screen>
    </>
  );
}
