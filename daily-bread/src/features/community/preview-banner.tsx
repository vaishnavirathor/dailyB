import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { t } from '@/i18n';
import { useCommunity } from '@/stores/community';
import { useLanguage } from '@/stores/settings';
import { colors, radius, spacing } from '@/theme';

/** Quiet strip shown while community runs on the offline preview. */
export function PreviewBanner() {
  const lang = useLanguage();
  const mode = useCommunity((s) => s.mode);
  if (mode === 'live') {
    return null;
  }
  return (
    <View
      style={{
        backgroundColor: colors.creamDarker,
        borderRadius: radius.base,
        borderCurve: 'continuous',
        paddingVertical: spacing.stackSm - 4,
        paddingHorizontal: spacing.gutter,
      }}
    >
      <ThemedText variant="labelMd" color="onSurfaceVariant">
        ⚡ {t('previewBanner', lang)}
      </ThemedText>
    </View>
  );
}
