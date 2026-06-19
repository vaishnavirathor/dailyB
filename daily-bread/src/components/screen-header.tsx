import type { ReactNode } from 'react';
import { View } from 'react-native';

import { MenuButton } from '@/components/menu-button';
import { ThemedText } from '@/components/themed-text';
import { spacing } from '@/theme';

export interface ScreenHeaderProps {
  title: string;
  /** Small uppercase eyebrow above the title (label-md, gold). */
  eyebrow?: string;
  subtitle?: string;
  /** Right-aligned accessory (e.g. streak pill). */
  accessory?: ReactNode;
  /** Renders the hamburger above the title (screens inside the drawer). */
  menu?: boolean;
}

/** Serif screen header in the hero style — spacious, scripture-first. */
export function ScreenHeader({ title, eyebrow, subtitle, accessory, menu }: ScreenHeaderProps) {
  return (
    <View style={{ gap: spacing.stackSm }}>
      {menu ? <MenuButton /> : null}
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: spacing.gutter }}>
        <View style={{ flex: 1, gap: 6 }}>
          {eyebrow ? (
            <ThemedText
              variant="labelMd"
              color="secondary"
              style={{ textTransform: 'uppercase', letterSpacing: 2.6 }}
            >
              {eyebrow}
            </ThemedText>
          ) : null}
          <ThemedText variant="headlineMd" color="primary">
            {title}
          </ThemedText>
          {subtitle ? (
            <ThemedText variant="bodySm" color="onSurfaceVariant">
              {subtitle}
            </ThemedText>
          ) : null}
        </View>
        {accessory}
      </View>
    </View>
  );
}
