import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { ChevronRightIcon, ChurchIcon } from '@/components/icons';
import { Screen } from '@/components/screen';
import { ScreenHeader } from '@/components/screen-header';
import { ThemedText } from '@/components/themed-text';
import { getCommunityRepository } from '@/community';
import type { Parish } from '@/community/types';
import type { Tradition } from '@/content/types';
import { PreviewBanner } from '@/features/community/preview-banner';
import { t, type StringKey } from '@/i18n';
import { useCommunity } from '@/stores/community';
import { useLanguage, useSettings } from '@/stores/settings';
import { colors, radius, spacing, textStyle, tints } from '@/theme';

const SERVICE_WORD: Record<Tradition, StringKey> = {
  protestant: 'serviceWordProtestant',
  catholic: 'serviceWordCatholic',
  orthodox: 'serviceWordOrthodox',
};

/**
 * Local Mass & Service Times — crowd-sourced parish timings. Submissions
 * go to moderation; the list shows approved entries.
 */
export default function MassTimesScreen() {
  const router = useRouter();
  const lang = useLanguage();
  const tradition = useSettings((s) => s.tradition);
  const [query, setQuery] = useState('');
  const [parishes, setParishes] = useState<Parish[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCity, setNewCity] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const load = useCallback(async (q: string) => {
    try {
      setFailed(false);
      await useCommunity.getState().connect();
      setParishes(await getCommunityRepository().listParishes(q));
    } catch (error) {
      console.warn('[parishes] load failed', error);
      setFailed(true);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load(query);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [load]),
  );

  const search = (q: string) => {
    setQuery(q);
    void load(q);
  };

  const submitParish = async () => {
    if (newName.trim().length < 2 || newCity.trim().length < 2) {
      return;
    }
    try {
      await getCommunityRepository().submitParish({
        name: newName.trim(),
        city: newCity.trim(),
        tradition,
      });
      setSubmitted(true);
      setNewName('');
      setNewCity('');
      setAdding(false);
      await load(query);
    } catch (error) {
      console.warn('[parishes] submit failed', error);
      setFailed(true);
    }
  };

  const inputStyle = textStyle('bodyMd', lang);
  const inputBase = {
    fontFamily: inputStyle.fontFamily,
    fontSize: inputStyle.fontSize,
    lineHeight: inputStyle.lineHeight,
    color: colors.onSurface,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
    paddingVertical: spacing.stackSm - 4,
  } as const;

  return (
    <Screen gap={spacing.stackMd}>
      <ScreenHeader menu eyebrow={t('sectionCommunity', lang)} title={t('massTimes', lang)} />
      <PreviewBanner />

      <TextInput
        value={query}
        onChangeText={search}
        placeholder={t('searchCity', lang)}
        placeholderTextColor={colors.outline}
        style={inputBase}
      />

      {failed ? (
        <ThemedText variant="bodySm" color="error" align="center">
          {t('communityError', lang)}
        </ThemedText>
      ) : null}
      {submitted ? (
        <ThemedText variant="bodySm" color="success" align="center">
          {t('submittedForReview', lang)}
        </ThemedText>
      ) : null}

      {(parishes ?? []).map((parish) => (
        <Pressable
          key={parish.id}
          accessibilityRole="button"
          onPress={() => router.push({ pathname: '/parish/[id]', params: { id: parish.id } })}
          style={({ pressed }) => ({
            backgroundColor: colors.surfaceContainerLowest,
            borderWidth: 1,
            borderColor: pressed ? colors.gold : colors.outlineVariant,
            borderRadius: radius.lg,
            borderCurve: 'continuous',
            padding: spacing.gutter,
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.gutter,
          })}
        >
          <View
            style={{
              width: 42,
              height: 42,
              borderRadius: radius.md,
              borderCurve: 'continuous',
              backgroundColor: tints.calendar,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ChurchIcon size={22} color={colors.navyMuted} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <ThemedText variant="bodyMd" color="primary">
              {parish.name}
            </ThemedText>
            <ThemedText variant="labelMd" color="onSurfaceVariant">
              {parish.city} · {t(SERVICE_WORD[parish.tradition], lang)}
            </ThemedText>
          </View>
          <ChevronRightIcon size={18} color={colors.outline} />
        </Pressable>
      ))}

      {adding ? (
        <Card padding={spacing.gutter} style={{ gap: spacing.stackSm }}>
          <ThemedText
            variant="labelMd"
            color="onSurfaceVariant"
            style={{ textTransform: 'uppercase', letterSpacing: 2.1 }}
          >
            {t('addParish', lang)}
          </ThemedText>
          <TextInput
            value={newName}
            onChangeText={setNewName}
            placeholder={t('parishName', lang)}
            placeholderTextColor={colors.outline}
            maxLength={120}
            style={inputBase}
          />
          <TextInput
            value={newCity}
            onChangeText={setNewCity}
            placeholder={t('city', lang)}
            placeholderTextColor={colors.outline}
            maxLength={60}
            style={inputBase}
          />
          <Button
            label={t('post', lang)}
            onPress={() => void submitParish()}
            disabled={newName.trim().length < 2 || newCity.trim().length < 2}
          />
        </Card>
      ) : (
        <Button label={t('addParish', lang)} variant="secondary" onPress={() => setAdding(true)} />
      )}
    </Screen>
  );
}
