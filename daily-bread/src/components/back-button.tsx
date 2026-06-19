import { useRouter } from 'expo-router';
import type { GestureResponderEvent } from 'react-native';
import { Pressable } from 'react-native';

import { ChevronLeftIcon } from '@/components/icons';
import { colors } from '@/theme';

export interface BackButtonProps {
  color?: string;
  size?: number;
  onPress?: (event: GestureResponderEvent) => void;
}

export function BackButton({ color = colors.primary, size = 24, onPress }: BackButtonProps) {
  const router = useRouter();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Go back"
      hitSlop={12}
      onPress={onPress ?? (() => router.back())}
    >
      <ChevronLeftIcon color={color} size={size} />
    </Pressable>
  );
}
