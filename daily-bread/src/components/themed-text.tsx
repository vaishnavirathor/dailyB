import { Text, type TextProps, type TextStyle } from 'react-native';

import { useLanguage, useSettings } from '@/stores/settings';
import { colors, textStyle, type ColorToken, type Lang, type TypographyVariant } from '@/theme';

const headingVariants: TypographyVariant[] = ['displayLg', 'headlineMd', 'headlineSm'];

export interface ThemedTextProps extends TextProps {
  variant?: TypographyVariant;
  /** Override the app language for this text (e.g. parallel display). */
  lang?: Lang;
  color?: ColorToken;
  align?: TextStyle['textAlign'];
  /** Multiplies font size and line height together (reader font-scale). */
  scale?: number;
}

/**
 * The one Text in the app. Resolves the dual-language type system: Telugu
 * swaps serif families to user-selected Telugu fonts.
 */
export function ThemedText({
  variant = 'bodyMd',
  lang,
  color = 'onSurface',
  align,
  scale = 1,
  style,
  children,
  maxFontSizeMultiplier = 1.6,
  ...rest
}: ThemedTextProps) {
  const appLang = useLanguage();
  const headingFont = useSettings((s) => s.teluguHeadingFont);
  const bodyFont = useSettings((s) => s.teluguBodyFont);
  const effectiveLang = lang ?? appLang;
  const isLabel = variant === 'labelMd' || variant === 'labelSm';
  const teluguFonts =
    effectiveLang === 'te' && !isLabel
      ? {
          heading: headingVariants.includes(variant) ? headingFont : undefined,
          body: !headingVariants.includes(variant) ? bodyFont : undefined,
        }
      : undefined;
  const spec = textStyle(variant, effectiveLang, teluguFonts);
  return (
    <Text
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      {...rest}
      style={[
        {
          fontFamily: spec.fontFamily,
          fontSize: spec.fontSize * scale,
          lineHeight: spec.lineHeight * scale,
          letterSpacing: spec.letterSpacing,
          color: colors[color],
          textAlign: align,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
