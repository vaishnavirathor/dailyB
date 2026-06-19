import * as Haptics from 'expo-haptics';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { Lang } from '@/theme';
import { colors, radius, spacing } from '@/theme';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  /** primary: deep navy with gold text · secondary: quiet navy outline. */
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  lang?: Lang;
  style?: StyleProp<ViewStyle>;
}

/**
 * Foundational button: substantial 16px vertical padding, navy fill with
 * gold text (primary) or a 1px navy-at-20% outline (secondary).
 */
export function Button({ label, onPress, variant = 'primary', disabled, lang, style }: ButtonProps) {
  const isPrimary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={() => {
        if (process.env.EXPO_OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPress();
      }}
      style={({ pressed }) => [
        {
          paddingVertical: spacing.unit * 2,
          paddingHorizontal: spacing.stackMd,
          borderRadius: radius.base,
          borderCurve: 'continuous',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isPrimary ? colors.primary : 'transparent',
          borderWidth: isPrimary ? 0 : 1,
          borderColor: isPrimary ? undefined : 'rgba(3,22,50,0.2)',
          opacity: disabled ? 0.4 : pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.985 : 1 }],
        },
        style,
      ]}
    >
      <ThemedText
        variant="labelMd"
        lang={lang}
        color={isPrimary ? 'secondaryContainer' : 'primary'}
        style={{ fontSize: 14, lineHeight: 20, letterSpacing: 0.4 }}
      >
        {label}
      </ThemedText>
    </Pressable>
  );
}
