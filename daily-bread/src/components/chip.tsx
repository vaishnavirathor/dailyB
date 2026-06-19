import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { colors, radius, tints } from '@/theme';

export type ChipFamily = 'core' | 'growth' | 'money' | 'sage';

const families: Record<ChipFamily, { background: string; color: string }> = {
  core: { background: tints.dailyLoop, color: colors.sage },
  growth: { background: tints.calendar, color: colors.navyMuted },
  money: { background: tints.money, color: colors.secondary },
  sage: { background: 'rgba(90,96,67,0.15)', color: colors.sage },
};

/** Uppercase functional tag — label-sm, 4px radius, family tint. */
export function Chip({ label, family = 'core' }: { label: string; family?: ChipFamily }) {
  const tone = families[family];
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        backgroundColor: tone.background,
        borderRadius: radius.sm,
        paddingVertical: 4,
        paddingHorizontal: 11,
      }}
    >
      <ThemedText variant="labelSm" style={{ color: tone.color, textTransform: 'uppercase' }}>
        {label}
      </ThemedText>
    </View>
  );
}
