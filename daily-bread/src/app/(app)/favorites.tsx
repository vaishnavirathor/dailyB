import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, Share, View } from 'react-native';

import { Card } from '@/components/card';
import { Chip } from '@/components/chip';
import { Screen } from '@/components/screen';
import { ScreenHeader } from '@/components/screen-header';
import { ThemedText } from '@/components/themed-text';
import { listFavorites, removeFavorite, type Favorite } from '@/data/favorites';
import { t, type StringKey } from '@/i18n';
import { useLanguage } from '@/stores/settings';
import { colors, spacing } from '@/theme';

const KIND_LABEL: Record<Favorite['kind'], StringKey> = {
  verse: 'verseOfTheDay',
  promise: 'dailyPromise',
  hymn: 'lyrics',
  bible: 'tabBible',
};

/** Saved verses, promises, hymn lines and Bible verses — share or release. */
export default function FavoritesScreen() {
  const lang = useLanguage();
  const [favorites, setFavorites] = useState<Favorite[]>([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      void listFavorites().then((all) => {
        if (active) {
          setFavorites(all);
        }
      });
      return () => {
        active = false;
      };
    }, []),
  );

  const share = async (favorite: Favorite) => {
    try {
      await Share.share({
        message: `"${favorite.payload.text}"\n— ${favorite.payload.reference}\n\nDaily Bread · దినసరి ఆహారం`,
      });
    } catch {
      // sheet dismissed
    }
  };

  const remove = async (favorite: Favorite) => {
    await removeFavorite(favorite.id);
    setFavorites((previous) => previous.filter((f) => f.id !== favorite.id));
  };

  return (
    <Screen gap={spacing.stackMd}>
      <ScreenHeader menu eyebrow={t('sectionLibrary', lang)} title={t('favorites', lang)} />

      {favorites.length === 0 ? (
        <ThemedText variant="bodySm" color="onSurfaceVariant" align="center">
          {t('favoritesEmpty', lang)}
        </ThemedText>
      ) : null}

      {favorites.map((favorite) => (
        <Card key={favorite.id} padding={spacing.gutter} style={{ gap: spacing.stackSm }}>
          <Chip label={t(KIND_LABEL[favorite.kind], lang)} family="core" />
          <ThemedText variant="bodyLg" lang="te" color="primary" selectable>
            {favorite.payload.text}
          </ThemedText>
          <ThemedText variant="labelMd" color="onSurfaceVariant" style={{ letterSpacing: 1.6 }}>
            {favorite.payload.reference}
          </ThemedText>
          <View style={{ flexDirection: 'row', gap: spacing.stackMd }}>
            <Pressable accessibilityRole="button" onPress={() => void share(favorite)}>
              <ThemedText variant="labelMd" color="secondary">
                ↗ {t('shareButton', lang)}
              </ThemedText>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={() => void remove(favorite)}>
              <ThemedText variant="labelMd" style={{ color: colors.clay }}>
                ✕ {t('delete', lang)}
              </ThemedText>
            </Pressable>
          </View>
        </Card>
      ))}
    </Screen>
  );
}
