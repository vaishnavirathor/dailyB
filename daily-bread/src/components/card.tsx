import { View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';

import { colors, radius, spacing } from '@/theme';

export interface CardProps extends ViewProps {
  /** Tonal layers, not shadows: white card on warm-white surface. */
  tone?: 'lowest' | 'cream';
  padding?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * The repeating container: surface-container-lowest fill, hairline
 * outline-variant border, 1rem radius. Depth comes from tone, not shadow.
 */
export function Card({ tone = 'lowest', padding = spacing.stackMd + 4, style, children, ...rest }: CardProps) {
  return (
    <View
      {...rest}
      style={[
        {
          backgroundColor: tone === 'lowest' ? colors.surfaceContainerLowest : colors.creamDarker,
          borderWidth: 1,
          borderColor: colors.outlineVariant,
          borderRadius: radius.lg,
          borderCurve: 'continuous',
          padding,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
