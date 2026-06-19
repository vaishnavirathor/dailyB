import type { ComponentType, ReactNode } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { IconProps } from '@/components/icons';
import {
  BookIcon,
  ChurchIcon,
  CrossIcon,
  GearIcon,
  HeartIcon,
  SproutIcon,
  PenIcon,
  PeopleIcon,
  PrayIcon,
  SunriseIcon,
} from '@/components/icons';
import { ThemedText } from '@/components/themed-text';
import { t, type StringKey } from '@/i18n';
import { useLanguage } from '@/stores/settings';
import { colors, radius, spacing } from '@/theme';

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
      { label: 'lyrics', icon: BookIcon, route: 'lyrics' },
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

/**
 * Structural prop type — expo-router v6 forked the drawer internals, so
 * we type only what we use instead of importing @react-navigation types.
 */
interface DrawerContentProps {
  state: { index: number; routes: { name: string }[] };
  navigation: {
    navigate: (name: string) => void;
    dispatch: (action: { type: string }) => void;
  };
}

/**
 * Warm Devotional drawer: cream surface, serif wordmark, quiet rows with
 * a soft gold active state — a sanctuary index, not an app menu.
 */
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
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing.stackMd,
          paddingBottom: insets.bottom + spacing.stackMd,
          paddingHorizontal: spacing.gutter,
          gap: spacing.stackSm,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ alignItems: 'center', gap: 6, paddingVertical: spacing.stackMd }}>
          <CrossIcon size={30} color={colors.gold} />
          <ThemedText variant="headlineSm" color="primary">
            Daily Bread
          </ThemedText>
          <ThemedText variant="bodySm" lang="te" color="navyMuted">
            దినసరి ఆహారం
          </ThemedText>
        </View>

        {sections.map((section, i) => (
          <View key={i} style={{ gap: 2 }}>
            {section.title ? (
              <ThemedText
                variant="labelSm"
                color="onSurfaceVariant"
                style={{
                  textTransform: 'uppercase',
                  letterSpacing: 1.8,
                  paddingHorizontal: spacing.stackSm,
                  paddingTop: spacing.stackSm + 4,
                  paddingBottom: 6,
                }}
              >
                {t(section.title, lang)}
              </ThemedText>
            ) : null}
            {section.items.map((item) => (
              <DrawerRow
                key={item.route}
                active={activeRoute === item.route}
                icon={<item.icon size={20} color={activeRoute === item.route ? colors.secondary : colors.navyMuted} />}
                label={t(item.label, lang)}
                onPress={() => go(item.route)}
              />
            ))}
          </View>
        ))}

        <ThemedText
          variant="labelSm"
          color="onSurfaceVariant"
          align="center"
          style={{ paddingTop: spacing.stackMd, letterSpacing: 1.4 }}
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
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.gutter,
        paddingVertical: spacing.stackSm,
        paddingHorizontal: spacing.stackSm,
        borderRadius: radius.md,
        borderCurve: 'continuous',
        backgroundColor: active ? 'rgba(168,128,31,0.10)' : pressed ? colors.surfaceContainerLow : 'transparent',
      })}
    >
      {icon}
      <ThemedText variant="bodyMd" color={active ? 'secondary' : 'primary'}>
        {label}
      </ThemedText>
    </Pressable>
  );
}
