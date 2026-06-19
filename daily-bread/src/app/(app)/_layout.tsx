import { Drawer } from 'expo-router/drawer';
import { View } from 'react-native';

import { DailyCurtain } from '@/features/daily-curtain/daily-curtain';
import { DrawerContent } from '@/features/navigation/drawer-content';
import { colors } from '@/theme';

/**
 * The signed-in app shell: a hamburger drawer over the tab group, with
 * the once-a-day Promise Curtain layered above everything — the first
 * thing a fresh day shows, lifted away like cloth to reveal Today.
 */
export default function AppLayout() {
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
      </Drawer>
      <DailyCurtain />
    </View>
  );
}
