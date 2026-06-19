import type { ComponentType, ReactNode } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { IconProps } from '@/components/icons';
import {
  ChurchIcon,
  CrossIcon,
  GearIcon,
  HeartIcon,
  SproutIcon,
  PenIcon,
  PeopleIcon,
  PrayIcon,
  SunriseIcon,
  MusicNoteIcon,
} from '@/components/icons';
import { ThemedText } from '@/components/themed-text';
import { t, type StringKey } from '@/i18n';
import { useLanguage } from '@/stores/settings';
import { colors, radius, spacing, tints } from '@/theme';

interface Item {
  label: StringKey;
  icon: ComponentType<IconProps>;
  route: string;
}

interface Section {
  title: StringKey | null;
  items: Item[];
}

const sections: Section[] = [
  {
    title: null,
    items: [{ label: 'menuHome', icon: SunriseIcon, route: '(tabs)' }],
  },
  {
    title: 'sectionCommunity',
    items: [
      { label: 'prayerWall', icon: PrayIcon, route: 'prayer-wall' },
      { label: 'groups', icon: PeopleIcon, route: 'groups' },
      { label: 'massTimes', icon: ChurchIcon, route: 'mass-times' },
    ],
  },
  {
    title: 'sectionLibrary',
    items: [
      { label: 'favorites', icon: HeartIcon, route: 'favorites' },
      { label: 'lyrics', icon: MusicNoteIcon, route: 'lyrics' },
      { label: 'journal', icon: PenIcon, route: 'journal' },
      { label: 'memorize', icon: SproutIcon, route: 'memorize' },
    ],
  },
  {
    title: 'sectionApp',
    items: [
      { label: 'settings', icon: GearIcon, route: 'settings' },
      { label: 'about', icon: CrossIcon, route: 'about' },
    ],
  },
];

interface DrawerContentProps {
  state: { index: number; routes: { name: string }[] };
  navigation: {
    navigate: (name: string) => void;
    dispatch: (action: { type: string }) => void;
  };
}

export function DrawerContent(props: DrawerContentProps) {
  const lang = useLanguage();
  const insets = useSafeAreaInsets();
  const activeRoute = props.state.routes[props.state.index]?.name;

  const go = (route: string) => {
    props.navigation.dispatch({ type: 'CLOSE_DRAWER' });
    props.navigation.navigate(route);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      {/* Brand header */}
      <View
        style={{
          paddingTop: insets.top + spacing.stackMd,
          paddingHorizontal: spacing.gutter,
          paddingBottom: spacing.stackMd,
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(0,0,0,0.04)',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.gutter }}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: radius.md,
              backgroundColor: tints.promise,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CrossIcon size={22} color={colors.gold} />
          </View>
          <View style={{ gap: 2 }}>
            <ThemedText variant="headlineSm" color="primary" style={{ fontWeight: '700' }}>
              Daily Bread
            </ThemedText>
            <ThemedText variant="bodySm" lang="te" color="navyMuted">
              దినసరి ఆహారం
            </ThemedText>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingTop: spacing.stackSm,
          paddingBottom: insets.bottom + spacing.stackMd,
          paddingHorizontal: spacing.gutter,
        }}
        showsVerticalScrollIndicator={false}
      >
        {sections.map((section, i) => (
          <View key={i} style={{ marginTop: i === 0 ? 0 : spacing.stackSm }}>
            {section.title ? (
              <ThemedText
                variant="labelSm"
                color="onSurfaceVariant"
                style={{
                  textTransform: 'uppercase',
                  letterSpacing: 1.8,
                  paddingHorizontal: spacing.stackSm,
                  paddingTop: spacing.stackSm,
                  paddingBottom: 6,
                  opacity: 0.6,
                }}
              >
                {t(section.title, lang)}
              </ThemedText>
            ) : null}

            {section.items.map((item) => {
              const isActive = activeRoute === item.route;
              return (
                <DrawerRow
                  key={item.route}
                  active={isActive}
                  icon={<item.icon size={20} color={isActive ? colors.secondary : colors.navyMuted} />}
                  label={t(item.label, lang)}
                  onPress={() => go(item.route)}
                />
              );
            })}

            {i < sections.length - 1 ? (
              <View
                style={{
                  height: 1,
                  backgroundColor: colors.surfaceContainerHigh,
                  marginHorizontal: spacing.stackSm,
                  marginTop: spacing.stackSm,
                }}
              />
            ) : null}
          </View>
        ))}

        <ThemedText
          variant="labelSm"
          color="onSurfaceVariant"
          align="center"
          style={{ paddingTop: spacing.stackMd, letterSpacing: 1.4, opacity: 0.5 }}
        >
          v1.0.0
        </ThemedText>
      </ScrollView>
    </View>
  );
}

function DrawerRow({
  icon,
  label,
  active,
  onPress,
}: {
  icon: ReactNode;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.96, { stiffness: 300, damping: 20 }); }}
      onPressOut={() => { scale.value = withSpring(1, { stiffness: 300, damping: 20 }); }}
    >
      <Animated.View style={animatedStyle}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.gutter,
            paddingVertical: spacing.stackSm - 2,
            paddingHorizontal: spacing.stackSm,
            borderRadius: radius.md,
            borderCurve: 'continuous',
            borderLeftWidth: 3,
            borderLeftColor: active ? colors.gold : 'transparent',
            backgroundColor: active ? tints.promise : 'transparent',
          }}
        >
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: radius.base,
              backgroundColor: active ? 'rgba(168,128,31,0.12)' : colors.surfaceContainerLow,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </View>
          <ThemedText variant="bodyMd" color={active ? 'secondary' : 'primary'} style={{ fontWeight: active ? '600' : '400' }}>
            {label}
          </ThemedText>
        </View>
      </Animated.View>
    </Pressable>
  );
}
