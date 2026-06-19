/**
 * Dual-language type system from DESIGN (2).md.
 *
 * Latin serif: Noto Serif (headings) + Source Serif 4 (body) + Inter (labels).
 * Telugu: Noto Serif Telugu everywhere serif is used — Source Serif 4 and Inter
 * carry no Telugu glyphs, so Telugu text in serif roles swaps families and
 * labels fall back to the system Telugu sans, which is acceptable for micro-copy.
 *
 * Line-height floors (research-verified): Android clips Indic conjuncts when
 * leading is tight (worse on Android 15). Telugu body keeps ≥1.8×, display ≥1.6×.
 */
export const fonts = {
  serifRegular: 'NotoSerif_400Regular',
  serifSemiBold: 'NotoSerif_600SemiBold',
  serifBold: 'NotoSerif_700Bold',
  serifItalic: 'NotoSerif_400Regular_Italic',
  teluguRegular: 'NotoSerifTelugu_400Regular',
  teluguSemiBold: 'NotoSerifTelugu_600SemiBold',
  teluguBold: 'NotoSerifTelugu_700Bold',
  bodyRegular: 'SourceSerif4_400Regular',
  bodySemiBold: 'SourceSerif4_600SemiBold',
  bodyItalic: 'SourceSerif4_400Regular_Italic',
  labelRegular: 'Inter_400Regular',
  labelMedium: 'Inter_500Medium',
  labelSemiBold: 'Inter_600SemiBold',
} as const;

export type Lang = 'te' | 'en';

export interface TextStyleSpec {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing?: number;
}

type Variant =
  | 'displayLg' // verse cards, daily promise (mobile scale of display-lg)
  | 'headlineMd'
  | 'headlineSm'
  | 'bodyLg' // default Bible reading size
  | 'bodyMd'
  | 'bodySm'
  | 'labelMd'
  | 'labelSm'
  | 'teluguDisplay'
  | 'teluguBody';

/** Latin styles — sizes from the design tokens (mobile display scale). */
const latin: Record<Variant, TextStyleSpec> = {
  displayLg: { fontFamily: fonts.serifBold, fontSize: 32, lineHeight: 40, letterSpacing: -0.64 },
  headlineMd: { fontFamily: fonts.serifSemiBold, fontSize: 28, lineHeight: 36 },
  headlineSm: { fontFamily: fonts.serifSemiBold, fontSize: 22, lineHeight: 28 },
  bodyLg: { fontFamily: fonts.bodyRegular, fontSize: 18, lineHeight: 32 },
  bodyMd: { fontFamily: fonts.bodyRegular, fontSize: 16, lineHeight: 28 },
  bodySm: { fontFamily: fonts.bodyRegular, fontSize: 14, lineHeight: 22 },
  labelMd: { fontFamily: fonts.labelMedium, fontSize: 12, lineHeight: 16, letterSpacing: 0.6 },
  labelSm: { fontFamily: fonts.labelSemiBold, fontSize: 10.5, lineHeight: 14, letterSpacing: 1.26 },
  teluguDisplay: { fontFamily: fonts.teluguRegular, fontSize: 36, lineHeight: 58 },
  teluguBody: { fontFamily: fonts.teluguRegular, fontSize: 18, lineHeight: 33 },
};

/**
 * Telugu overrides per variant: serif roles move to Noto Serif Telugu and
 * leading widens to the Indic floor (≥1.8× body, ≥1.6× display/headline).
 * Labels keep Inter metrics; Telugu glyphs inside labels fall back to the
 * system sans, which holds up at micro sizes.
 */
const telugu: Record<Variant, TextStyleSpec> = {
  displayLg: { fontFamily: fonts.teluguBold, fontSize: 30, lineHeight: 48, letterSpacing: 0 },
  headlineMd: { fontFamily: fonts.teluguSemiBold, fontSize: 26, lineHeight: 42 },
  headlineSm: { fontFamily: fonts.teluguSemiBold, fontSize: 21, lineHeight: 34 },
  bodyLg: { fontFamily: fonts.teluguRegular, fontSize: 18, lineHeight: 33 },
  bodyMd: { fontFamily: fonts.teluguRegular, fontSize: 16, lineHeight: 29 },
  bodySm: { fontFamily: fonts.teluguRegular, fontSize: 14, lineHeight: 26 },
  labelMd: latin.labelMd,
  labelSm: latin.labelSm,
  teluguDisplay: latin.teluguDisplay,
  teluguBody: latin.teluguBody,
};

export const typography = { latin, telugu } as const;
export type TypographyVariant = Variant;

export function textStyle(variant: Variant, lang: Lang): TextStyleSpec {
  return lang === 'te' ? telugu[variant] : latin[variant];
}
