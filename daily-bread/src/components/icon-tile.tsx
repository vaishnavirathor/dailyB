import { Text, View } from 'react-native';

import { iconTile, tints } from '@/theme';

/**
 * Feature icon tile: 46px rounded-md square filled with the family's
 * semantic tint, holding an emoji glyph (matching the blueprint).
 */
export function IconTile({ glyph, tint = tints.dailyLoop }: { glyph: string; tint?: string }) {
  return (
    <View
      style={{
        width: iconTile.size,
        height: iconTile.size,
        borderRadius: iconTile.radius,
        borderCurve: 'continuous',
        backgroundColor: tint,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontSize: iconTile.glyphSize }}>{glyph}</Text>
    </View>
  );
}
