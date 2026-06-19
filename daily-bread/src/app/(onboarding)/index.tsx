import { useRouter } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CrossIcon } from '@/components/icons';
import { ThemedText } from '@/components/themed-text';
import { useSettings } from '@/stores/settings';
import { colors, fonts, radius, spacing, type Lang } from '@/theme';

/**
 * Language-first onboarding: the language is chosen before the first verse
 * ever renders, so the daily loop is correct from day one. This screen is
 * deliberately bilingual — it precedes the choice.
 */
export default function LanguageScreen() {
  const router = useRouter();
  const setLanguage = useSettings((s) => s.setLanguage);
  const insets = useSafeAreaInsets();

  const choose = (lang: Lang) => {
    setLanguage(lang);
    router.push('/(onboarding)/tradition');
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.surface }}
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: 'center',
        padding: spacing.containerMargin,
        paddingTop: insets.top + spacing.stackLg,
        paddingBottom: insets.bottom + spacing.stackLg,
        gap: spacing.stackLg,
      }}
    >
      <View style={{ alignItems: 'center', gap: spacing.stackSm }}>
        <CrossIcon size={40} color={colors.gold} />
        <ThemedText
          variant="labelMd"
          color="secondary"
          style={{ textTransform: 'uppercase', letterSpacing: 3.4 }}
        >
          Daily Bread
        </ThemedText>
        <ThemedText variant="displayLg" lang="en" color="primary" align="center">
          Daily Bread
        </ThemedText>
        <ThemedText
          lang="te"
          color="navyMuted"
          align="center"
          style={{ fontFamily: fonts.teluguRegular, fontSize: 24, lineHeight: 40 }}
        >
          దినసరి ఆహారం
        </ThemedText>
      </View>

      <View style={{ gap: spacing.gutter }}>
        <ThemedText variant="bodyMd" color="onSurfaceVariant" align="center">
          మీ భాషను ఎంచుకోండి · Choose your language
        </ThemedText>

        <LanguageOption
          primary="తెలుగు"
          secondary="Telugu"
          telugu
          onPress={() => choose('te')}
        />
        <LanguageOption primary="English" secondary="ఇంగ్లీష్" onPress={() => choose('en')} />
      </View>
    </ScrollView>
  );
}

function LanguageOption({
  primary,
  secondary,
  telugu = false,
  onPress,
}: {
  primary: string;
  secondary: string;
  telugu?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: colors.surfaceContainerLowest,
        borderWidth: 1,
        borderColor: pressed ? colors.gold : colors.outlineVariant,
        borderRadius: radius.lg,
        borderCurve: 'continuous',
        paddingVertical: spacing.stackMd,
        paddingHorizontal: spacing.stackMd,
        alignItems: 'center',
        gap: 4,
        transform: [{ translateY: pressed ? -2 : 0 }],
      })}
    >
      <ThemedText
        style={{
          fontFamily: telugu ? fonts.teluguSemiBold : fonts.serifSemiBold,
          fontSize: 26,
          lineHeight: telugu ? 44 : 34,
          color: colors.primary,
        }}
      >
        {primary}
      </ThemedText>
      <ThemedText variant="labelMd" color="onSurfaceVariant">
        {secondary}
      </ThemedText>
    </Pressable>
  );
}
