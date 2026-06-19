import type { ReactNode } from 'react';
import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { colors, fonts, radius, shadows, spacing, type Lang } from '@/theme';

export interface VerseCardProps {
  kicker: string;
  text: string;
  reference: string;
  lang: Lang;
  accent?: 'sage' | 'gold';
  favorite?: ReactNode;
  children?: ReactNode;
}

export function VerseCard({ kicker, text, reference, lang, accent = 'sage', favorite, children }: VerseCardProps) {
  const isTelugu = lang === 'te';
  const accentColor = accent === 'gold' ? colors.gold : colors.sage;
  const border = accent === 'gold' ? 'rgba(168,128,31,0.2)' : 'rgba(90,96,67,0.12)';
  return (
    <View
      style={{
        backgroundColor: colors.surfaceContainerLowest,
        borderRadius: radius.xl,
        borderCurve: 'continuous',
        borderWidth: 1,
        borderColor: border,
        padding: spacing.stackMd + 8,
        gap: spacing.stackSm,
        boxShadow: shadows.verse,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        <View
          style={{
            width: 32,
            height: 2.5,
            borderRadius: radius.full,
            backgroundColor: accentColor,
            marginTop: 6,
          }}
        />
        <View style={{ flex: 1 }} />
        {favorite}
      </View>
      <ThemedText
        variant="labelMd"
        color="onSurfaceVariant"
        style={{ letterSpacing: 2, textTransform: 'uppercase' }}
      >
        {kicker}
      </ThemedText>
      <ThemedText
        selectable
        align="center"
        style={{
          fontFamily: isTelugu ? fonts.teluguRegular : fonts.serifItalic,
          fontSize: isTelugu ? 22 : 24,
          lineHeight: isTelugu ? 40 : 36,
          color: colors.primary,
        }}
      >
        {isTelugu ? text : `\u201c${text}\u201d`}
      </ThemedText>
      <ThemedText
        variant="labelSm"
        color="onSurfaceVariant"
        style={{ letterSpacing: 1.8, textTransform: 'uppercase', textAlign: 'right' }}
      >
        {reference}
      </ThemedText>
      {children ? (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: spacing.stackSm - 4,
          }}
        >
          {children}
        </View>
      ) : null}
    </View>
  );
}
