import { View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';

import { colors, radius, shadows, spacing } from '@/theme';

export interface CardProps extends ViewProps {
  tone?: 'lowest' | 'cream';
  padding?: number;
  style?: StyleProp<ViewStyle>;
}

export function Card({ tone = 'lowest', padding = spacing.stackMd + 8, style, children, ...rest }: CardProps) {
  return (
    <View
      {...rest}
      style={[
        {
          backgroundColor: tone === 'lowest' ? colors.surfaceContainerLowest : colors.creamDarker,
          borderWidth: 1,
          borderColor: tone === 'cream' ? 'rgba(168,128,31,0.18)' : colors.outlineVariant,
          borderRadius: radius.xl,
          borderCurve: 'continuous',
          padding,
          boxShadow: shadows.verse,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
