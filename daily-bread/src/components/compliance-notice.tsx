import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { colors, radius, spacing, tints } from '@/theme';

/**
 * Hard-compliance callout: error red at 5% fill with a 1px solid border.
 * REQUIRED usage (design): wraps the anointing/holy-oil rule — devotional
 * items are sold only as faith/cosmetic objects with zero health, healing
 * or supernatural-protection claims (Drugs & Magic Remedies
 * (Objectionable Advertisements) Act, 1954).
 */
export function ComplianceNotice({ title, body }: { title: string; body: string }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: spacing.gutter,
        backgroundColor: tints.warning,
        borderWidth: 1,
        borderColor: colors.error,
        borderRadius: radius.lg,
        borderCurve: 'continuous',
        padding: spacing.stackMd - 4,
      }}
    >
      <ThemedText style={{ fontSize: 22 }}>⚠️</ThemedText>
      <View style={{ flex: 1, gap: 6 }}>
        <ThemedText variant="headlineSm" style={{ color: colors.error }}>
          {title}
        </ThemedText>
        <ThemedText variant="bodySm" color="onSurfaceVariant">
          {body}
        </ThemedText>
      </View>
    </View>
  );
}
