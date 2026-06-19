import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Share, View } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { getCommunityRepository } from '@/community';
import type { Group } from '@/community/types';
import { PrayerWall } from '@/features/community/prayer-wall';
import { t } from '@/i18n';
import { useCommunity } from '@/stores/community';
import { useLanguage } from '@/stores/settings';
import { colors, fonts, radius, spacing, tints } from '@/theme';

/**
 * Group detail: the circle's own prayer wall plus the invite lever —
 * share the 6-char code anywhere WhatsApp reaches.
 */
export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const lang = useLanguage();
  const [group, setGroup] = useState<Group | null>(null);

  const load = useCallback(async () => {
    await useCommunity.getState().connect();
    const groups = await getCommunityRepository().myGroups();
    setGroup(groups.find((g) => g.id === id) ?? null);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const shareInvite = async () => {
    if (!group) {
      return;
    }
    const message = t('inviteMessage', lang)
      .replace('{name}', group.name)
      .replace('{code}', group.inviteCode);
    try {
      await Share.share({ message });
    } catch {
      // user dismissed the sheet — nothing to do
    }
  };

  const leave = async () => {
    if (group) {
      await getCommunityRepository().leaveGroup(group.id);
    }
    if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen gap={spacing.stackMd}>
        <View style={{ gap: 4 }}>
          <ThemedText
            variant="labelMd"
            color="secondary"
            style={{ textTransform: 'uppercase', letterSpacing: 2.6 }}
          >
            {t('groups', lang)}
          </ThemedText>
          <ThemedText variant="headlineMd" color="primary">
            {group?.name ?? '…'}
          </ThemedText>
          {group ? (
            <ThemedText variant="bodySm" color="onSurfaceVariant">
              {group.memberCount} {t('members', lang)}
            </ThemedText>
          ) : null}
        </View>

        {group ? (
          <Card tone="cream" padding={spacing.gutter} style={{ gap: spacing.stackSm }}>
            <ThemedText
              variant="labelMd"
              color="onSurfaceVariant"
              style={{ textTransform: 'uppercase', letterSpacing: 2.1 }}
            >
              {t('inviteCode', lang)}
            </ThemedText>
            <View
              style={{
                alignSelf: 'flex-start',
                backgroundColor: tints.calendar,
                borderRadius: radius.base,
                borderCurve: 'continuous',
                paddingVertical: 6,
                paddingHorizontal: 14,
              }}
            >
              <ThemedText
                selectable
                style={{
                  fontFamily: fonts.labelSemiBold,
                  fontSize: 22,
                  lineHeight: 30,
                  letterSpacing: 6,
                  color: colors.navyMuted,
                }}
              >
                {group.inviteCode}
              </ThemedText>
            </View>
            <Button label={t('shareInvite', lang)} onPress={() => void shareInvite()} />
          </Card>
        ) : null}

        <ThemedText
          variant="labelMd"
          color="onSurfaceVariant"
          style={{ textTransform: 'uppercase', letterSpacing: 2.1 }}
        >
          {t('groupWall', lang)}
        </ThemedText>
        <PrayerWall groupId={id} />

        <Button label={t('leaveGroup', lang)} variant="secondary" onPress={() => void leave()} />
      </Screen>
    </>
  );
}
