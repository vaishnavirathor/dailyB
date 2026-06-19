import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { colors, fonts, radius, shadows, spacing, type Lang } from '@/theme';

export interface VerseCardProps {
  kicker: string;
  text: string;
  reference: string;
  lang: Lang;
  /** 'sage' = Verse of the Day · 'gold' = the Daily Promise variant. */
  accent?: 'sage' | 'gold';
  /** Action row rendered under the reference (listen / share controls). */
  children?: ReactNode;
}

const gradients = {
  sage: ['rgba(90,96,67,0.13)', '#ffffff'] as const,
  gold: ['rgba(168,128,31,0.15)', '#fffdf6'] as const,
};

/**
 * The centerpiece component: scripture floating gently above the surface.
 * Sage→warm-white gradient (image-free variant), hairline border, 24px
 * radius, and the system's single diffused shadow.
 */
export function VerseCard({ kicker, text, reference, lang, accent = 'sage', children }: VerseCardProps) {
  const isTelugu = lang === 'te';
  return (
    <LinearGradient
      colors={gradients[accent]}
      locations={[0, 0.7]}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.7, y: 1 }}
      style={{
        borderRadius: radius.xl,
        borderCurve: 'continuous',
        borderWidth: 1,
        borderColor: accent === 'gold' ? 'rgba(168,128,31,0.25)' : colors.outlineVariant,
        paddingVertical: spacing.stackMd + 12,
        paddingHorizontal: spacing.stackMd + 4,
        boxShadow: shadows.verse,
        backgroundColor: colors.surfaceContainerLowest,
        gap: spacing.stackSm + 8,
      }}
    >
      <ThemedText
        selectable={false}
        style={{
          fontFamily: fonts.serifSemiBold,
          fontSize: 11,
          lineHeight: 16,
          letterSpacing: 3.2,
          textTransform: 'uppercase',
          color: colors.secondary,
          textAlign: 'center',
        }}
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
        {isTelugu ? text : `“${text}”`}
      </ThemedText>
      <ThemedText
        variant="labelMd"
        align="center"
        color="onSurfaceVariant"
        style={{ letterSpacing: 2.1, textTransform: 'uppercase' }}
      >
        {reference}
      </ThemedText>
      {children ? (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: spacing.stackMd,
            marginTop: 2,
          }}
        >
          {children}
        </View>
      ) : null}
    </LinearGradient>
  );
}
