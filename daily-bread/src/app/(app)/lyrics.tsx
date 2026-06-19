import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FavoriteButton } from '@/components/favorite-button';
import { SearchIcon } from '@/components/icons';
import { MenuButton } from '@/components/menu-button';
import { TAB_BAR_CLEARANCE } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { getContentRepository } from '@/content/bundled';
import type { Hymn } from '@/content/types';
import { t } from '@/i18n';
import { useLanguage, useSettings } from '@/stores/settings';
import { colors, radius, spacing, textStyle } from '@/theme';

/** Worship Lyrics — minimal grouped list. */
export default function LyricsListScreen() {
  const router = useRouter();
  const lang = useLanguage();
  const bodyFont = useSettings((s) => (lang === 'te' ? s.teluguBodyFont : s.englishBodyFont));
  const insets = useSafeAreaInsets();
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
    if (scripture.length) groups.push({ title: t('scriptureSong', lang), hymns: scripture });
    if (original.length) groups.push({ title: t('originalSong', lang), hymns: original });
    return groups;
  }, [filtered, lang]);

  const inputStyle = textStyle('bodyMd', lang, { body: bodyFont });

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <View
        style={{
          paddingTop: insets.top + spacing.stackSm,
          paddingHorizontal: spacing.containerMargin,
          backgroundColor: colors.surface,
        }}
      >
        <MenuButton />
        <ThemedText
          variant="headlineMd"
          color="primary"
          style={{ marginTop: spacing.stackSm, marginBottom: 2 }}
        >
          {t('lyrics', lang)}
        </ThemedText>
        <ThemedText variant="labelSm" color="onSurfaceVariant" style={{ marginBottom: spacing.stackMd }}>
          {allHymns.length} {lang === 'te' ? 'పాటలు' : 'songs'}
        </ThemedText>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.surfaceContainerLow,
            borderRadius: radius.lg,
            borderCurve: 'continuous',
            paddingHorizontal: spacing.gutter,
            gap: spacing.stackSm,
            height: 44,
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

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.containerMargin,
          paddingBottom: TAB_BAR_CLEARANCE,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {grouped.length === 0 ? (
          <View style={{ paddingVertical: 80, alignItems: 'center' }}>
            <ThemedText variant="bodyMd" color="onSurfaceVariant">
              {lang === 'te' ? 'ఏమీ కనబడలేదు' : 'No results'}
            </ThemedText>
          </View>
        ) : null}

        {grouped.map((section) => (
          <View key={section.title} style={{ marginBottom: spacing.stackLg }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.gutter,
                marginBottom: spacing.stackMd,
              }}
            >
              <ThemedText
                variant="bodySm"
                color="secondary"
                style={{ textTransform: 'uppercase', letterSpacing: 2, fontWeight: '700' }}
              >
                {section.title}
              </ThemedText>
              <View style={{ flex: 1, height: 1, backgroundColor: colors.surfaceContainerHigh }} />
              <ThemedText variant="labelSm" color="onSurfaceVariant">
                {section.hymns.length}
              </ThemedText>
            </View>

            {section.hymns.map((hymn) => (
              <Pressable
                key={hymn.id}
                accessibilityRole="button"
                onPress={() => router.push({ pathname: '/lyrics/[id]', params: { id: hymn.id } })}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: spacing.stackSm + 4,
                  paddingHorizontal: 4,
                  opacity: pressed ? 0.4 : 1,
                })}
              >
                <View style={{ flex: 1, gap: 2 }}>
                  <ThemedText
                    variant="bodyMd"
                    color="primary"
                    lang="te"
                    numberOfLines={1}
                    style={{ fontWeight: '500' }}
                  >
                    {hymn.title.te}
                  </ThemedText>
                  <ThemedText
                    variant="bodySm"
                    color="onSurfaceVariant"
                    numberOfLines={1}
                    style={{ fontStyle: 'italic' }}
                  >
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
                  size={16}
                />
              </Pressable>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
