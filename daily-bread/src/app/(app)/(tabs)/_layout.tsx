import { BlurView } from 'expo-blur';
import { Tabs, useNavigation } from 'expo-router';
import { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';

import { BagIcon, BookIcon, CalendarIcon, ShareIcon, SunriseIcon } from '@/components/icons';
import { t } from '@/i18n';
import { useBibleNav } from '@/stores/bible-navigation';
import { useLanguage } from '@/stores/settings';
import { colors, fonts } from '@/theme';

/**
 * Frosted-glass bottom navigation: backdrop blur over warm white, navy
 * icons, soft-gold active state (design: "Bottom Navigation").
 */
export default function TabsLayout() {
  const lang = useLanguage();
  const navigation = useNavigation();
  const prevTabIndex = useRef(-1);

  useEffect(() => {
    const unsub = navigation.addListener('state', () => {
      const state = navigation.getState();
      if (!state) return;
      const bibleRouteIdx = state.routeNames.indexOf('bible');
      if (bibleRouteIdx < 0) return;
      const enteringBible = state.index === bibleRouteIdx && prevTabIndex.current !== bibleRouteIdx;
      prevTabIndex.current = state.index;
      if (enteringBible) {
        useBibleNav.getState().setPendingTabRedirect(true);
      }
    });
    return unsub;
  }, [navigation]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.surface },
        tabBarActiveTintColor: colors.secondary,
        tabBarInactiveTintColor: colors.navyMuted,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: 'rgba(3,22,50,0.10)',
          elevation: 0,
        },
        tabBarBackground: () => (
          <BlurView
            intensity={36}
            tint="extraLight"
            experimentalBlurMethod="dimezisBlurView"
            style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(250,249,245,0.72)' }]}
          />
        ),
        tabBarLabelStyle: {
          fontFamily: fonts.labelMedium,
          fontSize: 10,
          letterSpacing: 0.2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabToday', lang),
          tabBarIcon: ({ color, size }) => <SunriseIcon color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="bible"
        options={{
          title: t('tabBible', lang),
          tabBarIcon: ({ color, size }) => <BookIcon color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: t('tabCalendar', lang),
          tabBarIcon: ({ color, size }) => <CalendarIcon color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="share"
        options={{
          title: t('tabShare', lang),
          tabBarIcon: ({ color, size }) => <ShareIcon color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="store"
        options={{
          title: t('tabStore', lang),
          tabBarIcon: ({ color, size }) => <BagIcon color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
