import { useCallback, useRef, useState } from 'react';
import { RefreshControl } from 'react-native';

import { Screen } from '@/components/screen';
import { ScreenHeader } from '@/components/screen-header';
import { PrayerWall } from '@/features/community/prayer-wall';
import { PreviewBanner } from '@/features/community/preview-banner';
import { t } from '@/i18n';
import { useLanguage } from '@/stores/settings';
import { colors, spacing } from '@/theme';

/**
 * The public Prayer Requests Wall — post a request, others tap
 * "I prayed". Moderated and family-safe by design.
 */
export default function PrayerWallScreen() {
  const lang = useLanguage();
  const [refreshing, setRefreshing] = useState(false);
  const refreshRef = useRef<() => Promise<void>>(async () => {});

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshRef.current();
    setRefreshing(false);
  }, []);

  return (
    <Screen
      gap={spacing.stackMd}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => void onRefresh()}
          tintColor={colors.sage}
        />
      }
    >
      <ScreenHeader
        menu
        eyebrow={t('sectionCommunity', lang)}
        title={t('prayerWall', lang)}
        subtitle={t('wallNote', lang)}
      />
      <PreviewBanner />
      <PrayerWall
        groupId={null}
        onRefreshReady={(refresh) => {
          refreshRef.current = refresh;
        }}
      />
    </Screen>
  );
}
