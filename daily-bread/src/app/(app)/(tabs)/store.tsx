import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

import { IconTile } from '@/components/icon-tile';
import { Screen } from '@/components/screen';
import { ScreenHeader } from '@/components/screen-header';
import { ThemedText } from '@/components/themed-text';
import { getContentRepository } from '@/content/bundled';
import type { ProductCategory } from '@/content/types';
import { formatInr } from '@/features/store/config';
import { t, type StringKey } from '@/i18n';
import { useLanguage } from '@/stores/settings';
import { colors, radius, spacing, tints } from '@/theme';

type Filter = ProductCategory | 'all';

const CATEGORY_LABELS: Record<Filter, StringKey> = {
  all: 'storeAll',
  bibles: 'categoryBibles',
  frames: 'categoryFrames',
  rosaries: 'categoryRosaries',
  candles: 'categoryCandles',
  devotional: 'categoryDevotional',
};

/**
 * Faith Storefront — quiet commerce. A curated chapel bookshop, not a
 * marketplace: calm cards, gold accents as small tints, price in
 * label-md, never oversized.
 */
export default function StoreScreen() {
  const router = useRouter();
  const lang = useLanguage();
  const [filter, setFilter] = useState<Filter>('all');
  const all = getContentRepository().products();

  const visible = useMemo(
    () => (filter === 'all' ? all : all.filter((p) => p.category === filter)),
    [all, filter],
  );

  // Two-column grid with equal-height rows.
  const rows = useMemo(() => {
    const result: (typeof visible)[] = [];
    for (let i = 0; i < visible.length; i += 2) {
      result.push(visible.slice(i, i + 2));
    }
    return result;
  }, [visible]);

  return (
    <Screen gap={spacing.stackMd}>
      <ScreenHeader
        menu
        eyebrow={t('tabStore', lang)}
        title={t('storeTitle', lang)}
        subtitle={t('storeSubtitle', lang)}
      />

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.stackSm - 4 }}>
        {(Object.keys(CATEGORY_LABELS) as Filter[]).map((category) => {
          const active = filter === category;
          return (
            <Pressable
              key={category}
              accessibilityRole="button"
              onPress={() => setFilter(category)}
              style={{
                paddingVertical: 6,
                paddingHorizontal: 12,
                borderRadius: radius.full,
                borderWidth: 1,
                borderColor: active ? colors.gold : colors.outlineVariant,
                backgroundColor: active ? '#fffaf0' : colors.surfaceContainerLowest,
              }}
            >
              <ThemedText
                variant="labelMd"
                style={{ color: active ? colors.secondary : colors.onSurfaceVariant }}
              >
                {t(CATEGORY_LABELS[category], lang)}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      <View style={{ gap: spacing.gutter }}>
        {rows.map((row, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: spacing.gutter }}>
            {row.map((product) => (
              <Pressable
                key={product.id}
                accessibilityRole="button"
                onPress={() =>
                  router.push({ pathname: '/product/[id]', params: { id: product.id } })
                }
                style={({ pressed }) => ({
                  flex: 1,
                  backgroundColor: colors.surfaceContainerLowest,
                  borderWidth: 1,
                  borderColor: pressed ? colors.gold : colors.outlineVariant,
                  borderRadius: radius.lg,
                  borderCurve: 'continuous',
                  padding: spacing.gutter,
                  gap: spacing.stackSm,
                })}
              >
                <IconTile glyph={product.emoji} tint={tints.money} />
                <ThemedText variant="bodyMd" color="primary" numberOfLines={2}>
                  {product.name[lang]}
                </ThemedText>
                {/* Price stays label-md — commerce never shouts. */}
                <ThemedText variant="labelMd" color="secondary">
                  {formatInr(product.priceInr)}
                </ThemedText>
              </Pressable>
            ))}
            {row.length === 1 ? <View style={{ flex: 1 }} /> : null}
          </View>
        ))}
      </View>
    </Screen>
  );
}
