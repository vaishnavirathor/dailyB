import { useNavigation } from 'expo-router';
import { Pressable } from 'react-native';

import { MenuIcon } from '@/components/icons';
import { colors } from '@/theme';

/**
 * Hamburger button — opens the app drawer from any screen inside it.
 * Dispatches the literal drawer action: SDK 56 expo-router forked away
 * from react-navigation, so @react-navigation/native must not be
 * imported (the bundler enforces it).
 */
export function MenuButton() {
  const navigation = useNavigation();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Menu"
      hitSlop={10}
      onPress={() => navigation.dispatch({ type: 'OPEN_DRAWER' })}
      style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, paddingVertical: 4 })}
    >
      <MenuIcon color={colors.primary} />
    </Pressable>
  );
}
