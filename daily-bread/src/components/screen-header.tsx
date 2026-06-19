import type { ReactNode } from 'react';
import { View } from 'react-native';

import { BackButton } from '@/components/back-button';
import { MenuButton } from '@/components/menu-button';
import { ThemedText } from '@/components/themed-text';
import { spacing } from '@/theme';

export interface ScreenHeaderProps {
  title: string;
  eyebrow?: string;
  subtitle?: string;
  accessory?: ReactNode;
  menu?: boolean;
  back?: boolean;
}

export function ScreenHeader({
  title,
  eyebrow,
  subtitle,
  accessory,
  menu,
  back,
}: ScreenHeaderProps) {
  return (
    <View style={{ gap: spacing.stackSm }}>
      {menu ? <MenuButton /> : null}
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: spacing.gutter }}>
        {back ? <BackButton /> : null}
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
