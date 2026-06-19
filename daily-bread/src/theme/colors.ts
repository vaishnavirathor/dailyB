/**
 * Warm Devotional palette — transcribed 1:1 from DESIGN (2).md frontmatter.
 * Philosophy: warm minimalism; deep navy + antique cream instead of black/white.
 */
export const colors = {
  // Surfaces
  surface: '#faf9f5',
  surfaceDim: '#dbdad6',
  surfaceBright: '#faf9f5',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f4f4f0',
  surfaceContainer: '#efeeea',
  surfaceContainerHigh: '#e9e8e4',
  surfaceContainerHighest: '#e3e2df',
  onSurface: '#1b1c1a',
  onSurfaceVariant: '#44474d',
  inverseSurface: '#2f312e',
  inverseOnSurface: '#f2f1ed',
  outline: '#75777e',
  outlineVariant: '#c5c6ce',
  surfaceTint: '#4e5f7e',

  // Primary — Deep Navy
  primary: '#031632',
  onPrimary: '#ffffff',
  primaryContainer: '#1a2b48',
  onPrimaryContainer: '#8293b5',
  inversePrimary: '#b6c7eb',

  // Secondary — Soft Gold
  secondary: '#735c00',
  onSecondary: '#ffffff',
  secondaryContainer: '#fed65b',
  onSecondaryContainer: '#745c00',

  // Tertiary — Sage family
  tertiary: '#121900',
  onTertiary: '#ffffff',
  tertiaryContainer: '#242f00',
  onTertiaryContainer: '#89995a',

  // Error
  error: '#ba1a1a',
  onError: '#ffffff',
  errorContainer: '#ffdad6',
  onErrorContainer: '#93000a',

  // Fixed roles
  primaryFixed: '#d7e2ff',
  primaryFixedDim: '#b6c7eb',
  onPrimaryFixed: '#081b38',
  onPrimaryFixedVariant: '#374765',
  secondaryFixed: '#ffe088',
  secondaryFixedDim: '#e9c349',
  onSecondaryFixed: '#241a00',
  onSecondaryFixedVariant: '#574500',
  tertiaryFixed: '#d9eaa3',
  tertiaryFixedDim: '#bdce89',
  onTertiaryFixed: '#161f00',
  onTertiaryFixedVariant: '#3e4c16',

  background: '#faf9f5',
  onBackground: '#1b1c1a',
  surfaceVariant: '#e3e2df',

  // Named accents
  clay: '#B66D52',
  creamDarker: '#F2EFE6',
  navyMuted: '#3A4B68',
  success: '#5a6043',
  warning: '#a8801f',

  // Convenience aliases used throughout the blueprint
  sage: '#5a6043',
  gold: '#a8801f',
  goldBright: '#e9c349',
} as const;

/**
 * Semantic family tints — only ever small fills (icon tiles, chips, hairlines),
 * never large surfaces competing with scripture.
 */
export const tints = {
  dailyLoop: 'rgba(90,96,67,0.13)', // Sage — the everyday ritual
  promise: 'rgba(168,128,31,0.15)', // Soft Gold — the one divine highlight
  calendar: 'rgba(58,75,104,0.13)', // Navy-muted — structural, liturgical
  sharing: 'rgba(58,75,104,0.13)', // Navy-muted
  festival: 'rgba(182,109,82,0.14)', // Clay — festival/occasion surfaces
  money: 'rgba(168,128,31,0.15)', // Soft Gold — commerce (post-MVP)
  warning: 'rgba(186,26,26,0.05)', // Error red 5% — hard compliance notices
} as const;

export type ColorToken = keyof typeof colors;
