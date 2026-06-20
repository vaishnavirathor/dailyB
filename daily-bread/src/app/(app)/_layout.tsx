import { Drawer } from 'expo-router/drawer';
import { useEffect } from 'react';
import { View } from 'react-native';
import { usePathname } from 'expo-router';

import { DailyCurtain } from '@/features/daily-curtain/daily-curtain';
import { DrawerContent } from '@/features/navigation/drawer-content';
import { trackScreen } from '@/services/app-tracking';
import { colors } from '@/theme';

/**
 * The signed-in app shell: a hamburger drawer over the tab group, with
 * the once-a-day Promise Curtain layered above everything — the first
 * thing a fresh day shows, lifted away like cloth to reveal Today.
 */
const PREV = { current: '' };

export default function AppLayout() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== PREV.current) {
      trackScreen(pathname, PREV.current || undefined);
      PREV.current = pathname;
    }
  }, [pathname]);

  return (
    <View style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props: any) => <DrawerContent {...props} />}
        screenOptions={{
          headerShown: false,
          drawerType: 'front',
          swipeEnabled: false,
          drawerStyle: {
            backgroundColor: colors.surface,
            width: 304,
          },
          sceneStyle: { backgroundColor: colors.surface },
        }}
      >
        <Drawer.Screen name="(tabs)" />
        <Drawer.Screen name="prayer-wall" />
        <Drawer.Screen name="groups" />
        <Drawer.Screen name="mass-times" />
        <Drawer.Screen name="favorites" />
        <Drawer.Screen name="lyrics" />
        <Drawer.Screen name="journal" />
        <Drawer.Screen name="memorize" />
        <Drawer.Screen name="settings" />
        <Drawer.Screen name="about" />
        <Drawer.Screen name="auth" />
      </Drawer>
      <DailyCurtain />
    </View>
  );
}
