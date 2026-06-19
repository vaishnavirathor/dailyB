import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { ChevronRightIcon, PeopleIcon } from '@/components/icons';
import { Screen } from '@/components/screen';
import { ScreenHeader } from '@/components/screen-header';
import { ThemedText } from '@/components/themed-text';
import { getCommunityRepository } from '@/community';
import { isValidInviteCode } from '@/community/invite-code';
import type { Group } from '@/community/types';
import { PreviewBanner } from '@/features/community/preview-banner';
import { t } from '@/i18n';
import { useCommunity } from '@/stores/community';
import { useLanguage, useSettings } from '@/stores/settings';
import { colors, radius, spacing, textStyle, tints } from '@/theme';

/**
 * Family & Church Groups — private accountability circles. The invite
 * flow is the cheapest acquisition lever there is, so joining is one
 * 6-character code.
 */
export default function GroupsScreen() {
  const router = useRouter();
  const lang = useLanguage();
  const englishHeadingFont = useSettings((s) => s.englishHeadingFont);
  const englishBodyFont = useSettings((s) => s.englishBodyFont);
  const [groups, setGroups] = useState<Group[] | null>(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [codeError, setCodeError] = useState(false);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    try {
      setFailed(false);
      await useCommunity.getState().connect();
      setGroups(await getCommunityRepository().myGroups());
    } catch (error) {
      console.warn('[groups] load failed', error);
      setFailed(true);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const create = async () => {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      return;
    }
    setBusy(true);
    try {
      const group = await getCommunityRepository().createGroup(trimmed);
      setName('');
      await load();
      router.push({ pathname: '/group/[id]', params: { id: group.id } });
    } catch (error) {
      console.warn('[groups] create failed', error);
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  const join = async () => {
    setCodeError(false);
    if (!isValidInviteCode(code)) {
      setCodeError(true);
      return;
    }
    setBusy(true);
    try {
      const group = await getCommunityRepository().joinGroup(code);
      if (group === null) {
        setCodeError(true);
      } else {
        setCode('');
        await load();
        router.push({ pathname: '/group/[id]', params: { id: group.id } });
      }
    } catch (error) {
      console.warn('[groups] join failed', error);
      setFailed(true);
    } finally {
      setBusy(false);
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
      <ScreenHeader menu eyebrow={t('sectionCommunity', lang)} title={t('groups', lang)} />
      <PreviewBanner />

      {groups !== null && groups.length === 0 ? (
        <ThemedText variant="bodySm" color="onSurfaceVariant" align="center">
          {t('groupsEmpty', lang)}
        </ThemedText>
      ) : null}
      {failed ? (
        <ThemedText variant="bodySm" color="error" align="center">
          {t('communityError', lang)}
        </ThemedText>
      ) : null}

      {(groups ?? []).map((group) => (
        <Pressable
          key={group.id}
          accessibilityRole="button"
          onPress={() => router.push({ pathname: '/group/[id]', params: { id: group.id } })}
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
            <PeopleIcon size={22} color={colors.navyMuted} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <ThemedText variant="bodyMd" color="primary">
              {group.name}
            </ThemedText>
            <ThemedText variant="labelMd" color="onSurfaceVariant">
              {group.memberCount} {t('members', lang)} · {group.inviteCode}
            </ThemedText>
          </View>
          <ChevronRightIcon size={18} color={colors.outline} />
        </Pressable>
      ))}

      {/* Create */}
      <Card padding={spacing.gutter} style={{ gap: spacing.stackSm }}>
        <ThemedText
          variant="labelMd"
          color="onSurfaceVariant"
          style={{ textTransform: 'uppercase', letterSpacing: 2.1 }}
        >
          {t('createGroup', lang)}
        </ThemedText>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder={t('groupName', lang)}
          placeholderTextColor={colors.outline}
          maxLength={60}
          style={inputBase}
        />
        <Button
          label={t('create', lang)}
          onPress={() => void create()}
          disabled={busy || name.trim().length < 2}
        />
      </Card>

      {/* Join */}
      <Card padding={spacing.gutter} style={{ gap: spacing.stackSm }}>
        <ThemedText
          variant="labelMd"
          color="onSurfaceVariant"
          style={{ textTransform: 'uppercase', letterSpacing: 2.1 }}
        >
          {t('joinGroup', lang)}
        </ThemedText>
        <TextInput
          value={code}
          onChangeText={(v) => {
            setCode(v.toUpperCase());
            setCodeError(false);
          }}
          placeholder={t('inviteCode', lang)}
          placeholderTextColor={colors.outline}
          autoCapitalize="characters"
          maxLength={8}
          style={[inputBase, { letterSpacing: 4 }]}
        />
        {codeError ? (
          <ThemedText variant="bodySm" color="error">
            {t('invalidCode', lang)}
          </ThemedText>
        ) : null}
        <Button
          label={t('join', lang)}
          variant="secondary"
          onPress={() => void join()}
          disabled={busy || code.trim().length === 0}
        />
      </Card>
    </Screen>
  );
}
