import { useEffect, useState } from 'react';
import { Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  withSpring,
  useAnimatedStyle,
} from 'react-native-reanimated';

import { HeartIcon } from '@/components/icons';
import { isFavorite, toggleFavorite, type FavoriteKind, type FavoritePayload } from '@/data/favorites';
import { colors } from '@/theme';

/** Heart with a spring-scale bounce when toggled. */
export function FavoriteButton({
  kind,
  refId,
  payload,
  size = 18,
}: {
  kind: FavoriteKind;
  refId: string;
  payload: FavoritePayload;
  size?: number;
}) {
  const [saved, setSaved] = useState<boolean | null>(null);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  useEffect(() => {
    let active = true;
    void isFavorite(kind, refId).then((value) => {
      if (active) {
        setSaved(value);
      }
    });
    return () => {
      active = false;
    };
  }, [kind, refId]);

  const toggle = () => {
    scale.value = withSpring(1.35, { stiffness: 300, damping: 6 }, () => {
      scale.value = withSpring(1, { stiffness: 200, damping: 10 });
    });
    void toggleFavorite(kind, refId, payload).then(setSaved);
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Favorite"
      hitSlop={10}
      onPress={toggle}
      style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
    >
      <Animated.View style={animatedStyle}>
        <HeartIcon size={size} color={colors.outline} filled={saved ?? false} />
      </Animated.View>
    </Pressable>
  );
}
