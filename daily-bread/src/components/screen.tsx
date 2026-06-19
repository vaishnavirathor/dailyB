import type { ReactElement, ReactNode } from 'react';
import {
  ScrollView,
  type RefreshControlProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from '@/theme';

/** Clearance for the floating frosted tab bar. */
export const TAB_BAR_CLEARANCE = 104;

export interface ScreenProps {
  children: ReactNode;
  gap?: number;
  /** Extra bottom padding — defaults to tab-bar clearance. */
  bottom?: number;
  contentStyle?: StyleProp<ViewStyle>;
  /** Pull-to-refresh control (community feeds). */
  refreshControl?: ReactElement<RefreshControlProps>;
}

/**
 * Standard scrollable screen: warm-white surface, 24px container margins,
 * safe-area aware, content clears the floating tab bar.
 */
export function Screen({
  children,
  gap = spacing.stackMd,
  bottom = TAB_BAR_CLEARANCE,
  contentStyle,
  refreshControl,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.surface }}
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={refreshControl}
      contentContainerStyle={[
        {
          paddingTop: insets.top + 4,
          paddingHorizontal: spacing.containerMargin,
          paddingBottom: bottom,
          gap,
        },
        contentStyle,
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}
