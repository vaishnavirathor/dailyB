import type { ComponentType, ReactNode } from 'react';
import { Pressable, ScrollView, View, StyleSheet } from 'react-native';
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
  UserIcon,
  CheckIcon,
} from '@/components/icons';
import { ThemedText } from '@/components/themed-text';
import { t, type StringKey } from '@/i18n';
import { useAuth } from '@/stores/auth';
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
      { label: 'lyrics', icon: MusicNoteIcon, route: 'lyrics' },
      { label: 'journal', icon: PenIcon, route: 'journal' },
      { label: 'memorize', icon: SproutIcon, route: 'memorize' },
    ],
  },
  {
    title: 'sectionApp',
    items: [
      { label: 'account', icon: UserIcon, route: 'auth' },
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
  const { isAuthenticated, profile, verified } = useAuth();

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
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.outlineVariant,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.gutter }}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: radius.md,
              backgroundColor: 'rgba(168,128,31,0.15)',
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
        {isAuthenticated ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.stackSm }}>
            <View style={{
              width: 22, height: 22, borderRadius: 11,
              backgroundColor: colors.sage, alignItems: 'center', justifyContent: 'center',
            }}>
              <ThemedText variant="labelSm" color="onPrimary" style={{ fontSize: 10, fontWeight: '600' }}>
                {(profile?.display_name || 'U')[0]?.toUpperCase()}
              </ThemedText>
            </View>
            <ThemedText variant="bodySm" color="onSurfaceVariant" style={{ flex: 1 }} numberOfLines={1}>
              {profile?.display_name || 'Signed in'}
            </ThemedText>
            {verified ? (
              <CheckIcon size={10} color={colors.sage} />
            ) : null}
          </View>
        ) : null}
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
          <View key={i} style={{ marginTop: i === 0 ? 0 : spacing.stackMd }}>
            {section.title ? (
              <ThemedText
                variant="labelSm"
                color="onSurfaceVariant"
                style={{
                  letterSpacing: 0.8,
                  paddingHorizontal: spacing.stackSm,
                  paddingBottom: 6,
                  opacity: 0.45,
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
                  icon={<item.icon size={18} color={isActive ? colors.secondary : colors.onSurfaceVariant} />}
                  label={t(item.label, lang)}
                  onPress={() => go(item.route)}
                />
              );
            })}

            {i < sections.length - 1 ? (
              <View
                style={{
                  height: StyleSheet.hairlineWidth,
                  backgroundColor: colors.outlineVariant,
                  marginHorizontal: spacing.stackSm,
                  marginTop: spacing.stackMd,
                  opacity: 0.6,
                }}
              />
            ) : null}
          </View>
        ))}

        <ThemedText
          variant="labelSm"
          color="onSurfaceVariant"
          align="center"
          style={{ paddingTop: spacing.stackLg, opacity: 0.35 }}
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
        paddingVertical: 10,
        paddingHorizontal: spacing.stackSm,
        borderRadius: radius.base,
        backgroundColor: active
          ? 'rgba(168,128,31,0.08)'
          : pressed
            ? 'rgba(0,0,0,0.03)'
            : 'transparent',
        opacity: pressed ? 0.85 : 1,
      })}
    >
      {icon}
      <ThemedText
        variant="bodyMd"
        color={active ? 'secondary' : 'onSurfaceVariant'}
        style={{ fontWeight: active ? '500' : '400' }}
      >
        {label}
      </ThemedText>
    </Pressable>
  );
}
