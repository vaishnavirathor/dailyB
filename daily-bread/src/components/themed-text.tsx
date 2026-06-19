import { Text, type TextProps, type TextStyle } from 'react-native';

import { useLanguage } from '@/stores/settings';
import { colors, textStyle, type ColorToken, type Lang, type TypographyVariant } from '@/theme';

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
 * swaps serif families to Noto Serif Telugu and keeps the Indic leading
 * floor so conjunct glyphs never clip on Android.
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
  const spec = textStyle(variant, lang ?? appLang);
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
