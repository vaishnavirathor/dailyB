/** Spacing & shape tokens from DESIGN (2).md — strict 8px baseline grid. */
export const spacing = {
  unit: 8,
  containerMargin: 24, // standard mobile margin — scripture never touches edges
  gutter: 16,
  stackSm: 12,
  stackMd: 24,
  stackLg: 48, // intentional pause between scripture blocks
} as const;

/** rem-based radii mapped to dp (1rem = 16dp). */
export const radius = {
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 24, // verse cards & promise modules — smooth stones
  full: 9999,
} as const;

/** The only significant depth in the system — the floating verse card. */
export const shadows = {
  verse: '0 4px 20px rgba(3,22,50,0.06)',
  cardHover: '0 6px 24px rgba(3,22,50,0.07)',
} as const;

/** Feature icon tiles: 46px rounded-md, filled with a family tint. */
export const iconTile = { size: 46, radius: radius.md, glyphSize: 22 } as const;
