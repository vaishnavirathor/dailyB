import { useRouter } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CloseIcon } from '@/components/icons';
import { ThemedText } from '@/components/themed-text';
import { getContentRepository } from '@/content/bundled';
import { t } from '@/i18n';
import { useProgress } from '@/stores/progress';
import { fontScaleFactor, useLanguage, useSettings } from '@/stores/settings';
import { colors, radius, spacing } from '@/theme';

/**
 * Large-font reader — the accessibility fallback promised by the design:
 * verse + reflection at a user-controlled scale for older and low-vision
 * readers. The A−/A+ control persists to settings.
 */
export default function ReaderScreen() {
  const router = useRouter();
  const lang = useLanguage();
  const insets = useSafeAreaInsets();
  const todayKey = useProgress((s) => s.todayKey);
  const fontScale = useSettings((s) => s.fontScale);
  const setFontScale = useSettings((s) => s.setFontScale);

  const repo = getContentRepository();
  const verse = repo.verseFor(todayKey);
  const reflection = repo.reflectionFor(todayKey);
  const scale = fontScaleFactor[fontScale] * 1.25;

  const scales = ['normal', 'large', 'xl'] as const;
  const index = scales.indexOf(fontScale);

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: insets.top + spacing.stackSm,
          paddingHorizontal: spacing.containerMargin,
          paddingBottom: spacing.stackSm,
        }}
      >
        <View style={{ flexDirection: 'row', gap: spacing.stackSm }}>
          <ScaleButton
            label="A−"
            disabled={index === 0}
            onPress={() => setFontScale(scales[Math.max(0, index - 1)])}
          />
          <ScaleButton
            label="A+"
            disabled={index === scales.length - 1}
            onPress={() => setFontScale(scales[Math.min(scales.length - 1, index + 1)])}
          />
        </View>
        <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={12}>
          <CloseIcon color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: spacing.containerMargin,
          paddingBottom: insets.bottom + spacing.stackLg,
          gap: spacing.stackLg,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: spacing.stackSm }}>
          <ThemedText
            variant="labelMd"
            color="secondary"
            style={{ textTransform: 'uppercase', letterSpacing: 2.6 }}
          >
            {t('verseOfTheDay', lang)}
          </ThemedText>
          <ThemedText variant="bodyLg" scale={scale} color="primary">
            {verse.text[lang]}
          </ThemedText>
          <ThemedText variant="labelMd" color="onSurfaceVariant" style={{ letterSpacing: 1.8 }}>
            {verse.reference[lang]}
          </ThemedText>
        </View>

        <View style={{ gap: spacing.stackSm }}>
          <ThemedText
            variant="labelMd"
            color="secondary"
            style={{ textTransform: 'uppercase', letterSpacing: 2.6 }}
          >
            {t('reflection', lang)}
          </ThemedText>
          <ThemedText variant="bodyLg" scale={scale} color="onSurface">
            {reflection.body[lang]}
          </ThemedText>
        </View>
      </ScrollView>
    </View>
  );
}

function ScaleButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={{
        borderWidth: 1,
        borderColor: colors.outlineVariant,
        borderRadius: radius.base,
        borderCurve: 'continuous',
        paddingVertical: 6,
        paddingHorizontal: 14,
        opacity: disabled ? 0.4 : 1,
        backgroundColor: colors.surfaceContainerLowest,
      }}
    >
      <ThemedText variant="bodySm" color="primary">
        {label}
      </ThemedText>
    </Pressable>
  );
}
