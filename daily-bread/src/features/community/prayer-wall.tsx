import { useCallback, useEffect, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { ThemedText } from '@/components/themed-text';
import { getCommunityRepository } from '@/community';
import type { PrayerRequest } from '@/community/types';
import { t } from '@/i18n';
import { useCommunity } from '@/stores/community';
import { useLanguage, useSettings } from '@/stores/settings';
import { colors, radius, spacing, textStyle, tints, type Lang } from '@/theme';

/**
 * The prayer wall — shared between the public wall and group walls.
 * Post a request, tap "I prayed", report quietly. Family-safe, calm.
 */
export function PrayerWall({
  groupId,
  onRefreshReady,
}: {
  groupId: string | null;
  /** Hands the parent a refresh fn for its RefreshControl. */
  onRefreshReady?: (refresh: () => Promise<void>) => void;
}) {
  const lang = useLanguage();
  const englishHeadingFont = useSettings((s) => s.englishHeadingFont);
  const englishBodyFont = useSettings((s) => s.englishBodyFont);
  const profile = useCommunity((s) => s.profile);
  const ready = useCommunity((s) => s.ready);
  const setDisplayName = useCommunity((s) => s.setDisplayName);

  const [requests, setRequests] = useState<PrayerRequest[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [draft, setDraft] = useState('');
  const [nameDraft, setNameDraft] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setFailed(false);
      setRequests(await getCommunityRepository().listPrayerRequests(groupId));
    } catch (error) {
      console.warn('[wall] load failed', error);
      setFailed(true);
    }
  }, [groupId]);

  useEffect(() => {
    void useCommunity.getState().connect().then(load);
  }, [load]);

  useEffect(() => {
    onRefreshReady?.(load);
  }, [load, onRefreshReady]);

  const needsName = ready && profile !== null && profile.displayName.trim().length === 0;

  const post = async () => {
    const body = draft.trim();
    if (body.length < 3) {
      return;
    }
    setBusy(true);
    try {
      await getCommunityRepository().postPrayerRequest(body, groupId);
      setDraft('');
      await load();
    } catch (error) {
      console.warn('[wall] post failed', error);
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  const saveName = async () => {
    if (nameDraft.trim().length > 0) {
      await setDisplayName(nameDraft);
    }
  };

  const isEnglish = lang === 'en';
  const fontOverrides = isEnglish
    ? { heading: englishHeadingFont, body: englishBodyFont }
    : undefined;
  const inputStyle = textStyle('bodyMd', lang, fontOverrides);

  return (
    <View style={{ gap: spacing.stackMd }}>
      {/* First-post identity: a gentle one-time name prompt. */}
      {needsName ? (
        <Card tone="cream" padding={spacing.gutter} style={{ gap: spacing.stackSm }}>
          <ThemedText variant="headlineSm" color="primary">
            {t('displayNameTitle', lang)}
          </ThemedText>
          <ThemedText variant="bodySm" color="onSurfaceVariant">
            {t('displayNameSub', lang)}
          </ThemedText>
          <TextInput
            value={nameDraft}
            onChangeText={setNameDraft}
            placeholder={t('displayNamePlaceholder', lang)}
            placeholderTextColor={colors.outline}
            maxLength={30}
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
          <Button label={t('save', lang)} onPress={() => void saveName()} />
        </Card>
      ) : (
        <Card padding={spacing.gutter} style={{ gap: spacing.stackSm }}>
          <ThemedText
            variant="labelMd"
            color="onSurfaceVariant"
            style={{ textTransform: 'uppercase', letterSpacing: 2.1 }}
          >
            {t('postRequest', lang)}
          </ThemedText>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={t('requestPlaceholder', lang)}
            placeholderTextColor={colors.outline}
            multiline
            maxLength={500}
            style={{
              fontFamily: inputStyle.fontFamily,
              fontSize: inputStyle.fontSize,
              lineHeight: inputStyle.lineHeight,
              color: colors.onSurface,
              borderBottomWidth: 1,
              borderBottomColor: colors.outlineVariant,
              paddingVertical: spacing.stackSm - 4,
              minHeight: 56,
              textAlignVertical: 'top',
            }}
          />
          <Button
            label={t('post', lang)}
            onPress={() => void post()}
            disabled={busy || draft.trim().length < 3}
          />
        </Card>
      )}

      {failed ? (
        <ThemedText variant="bodySm" color="error" align="center">
          {t('communityError', lang)}
        </ThemedText>
      ) : null}

      {requests !== null && requests.length === 0 && !failed ? (
        <ThemedText variant="bodySm" color="onSurfaceVariant" align="center">
          {t('wallEmpty', lang)}
        </ThemedText>
      ) : null}

      {(requests ?? []).map((request) => (
        <RequestCard key={request.id} request={request} lang={lang} onChanged={load} />
      ))}
    </View>
  );
}

function RequestCard({
  request,
  lang,
  onChanged,
}: {
  request: PrayerRequest;
  lang: Lang;
  onChanged: () => Promise<void>;
}) {
  const [reported, setReported] = useState(false);

  const pray = async () => {
    if (!request.prayedByMe) {
      await getCommunityRepository().togglePrayed(request.id);
      await onChanged();
    }
  };

  const report = async () => {
    setReported(true);
    await getCommunityRepository().reportRequest(request.id);
    await onChanged();
  };

  return (
    <Card padding={spacing.gutter} style={{ gap: spacing.stackSm }}>
      <ThemedText variant="bodyMd" color="onSurface" selectable>
        {request.body}
      </ThemedText>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.gutter }}>
        <ThemedText variant="labelMd" color="onSurfaceVariant" style={{ flex: 1 }}>
          {request.authorName} · {relativeDay(request.createdAt, lang)}
        </ThemedText>
        {!request.mine && !reported ? (
          <Pressable accessibilityRole="button" onPress={() => void report()} hitSlop={8}>
            <ThemedText variant="labelSm" color="onSurfaceVariant">
              {t('report', lang)}
            </ThemedText>
          </Pressable>
        ) : null}
        <Pressable
          accessibilityRole="button"
          onPress={() => void pray()}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            backgroundColor: request.prayedByMe ? colors.sage : tints.dailyLoop,
            borderRadius: radius.full,
            paddingVertical: 6,
            paddingHorizontal: 12,
          }}
        >
          <ThemedText
            variant="labelMd"
            style={{
              color: request.prayedByMe ? colors.onPrimary : colors.sage,
              fontVariant: ['tabular-nums'],
            }}
          >
            🙏 {request.prayedCount} {request.prayedByMe ? '' : `· ${t('iPrayed', lang)}`}
          </ThemedText>
        </Pressable>
      </View>
    </Card>
  );
}

function relativeDay(iso: string, lang: Lang): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) {
    return t('today', lang);
  }
  if (days === 1) {
    return lang === 'te' ? 'నిన్న' : 'yesterday';
  }
  return lang === 'te' ? `${days} రోజుల క్రితం` : `${days} days ago`;
}
