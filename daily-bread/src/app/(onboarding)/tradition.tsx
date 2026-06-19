import { useRouter } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { CheckIcon } from '@/components/icons';
import { ThemedText } from '@/components/themed-text';
import { t } from '@/i18n';
import { useLanguage, useSettings, type Tradition } from '@/stores/settings';
import { colors, radius, spacing } from '@/theme';

/**
 * Denomination-aware from first run — all three layers are live: the
 * tradition shapes the calendar, seasons, feasts and reminders.
 */
export default function TraditionScreen() {
  const router = useRouter();
  const lang = useLanguage();
  const tradition = useSettings((s) => s.tradition);
  const setTradition = useSettings((s) => s.setTradition);
  const insets = useSafeAreaInsets();

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
      <View style={{ gap: spacing.stackSm }}>
        <ThemedText variant="headlineMd" color="primary" align="center">
          {t('onboardingTraditionTitle', lang)}
        </ThemedText>
        <ThemedText variant="bodyMd" color="onSurfaceVariant" align="center">
          {t('onboardingTraditionSub', lang)}
        </ThemedText>
      </View>

      <View style={{ gap: spacing.gutter }}>
        <TraditionRow
          id="protestant"
          label={t('traditionProtestant', lang)}
          selected={tradition === 'protestant'}
          onPress={() => setTradition('protestant')}
        />
        <TraditionRow
          id="catholic"
          label={t('traditionCatholic', lang)}
          selected={tradition === 'catholic'}
          onPress={() => setTradition('catholic')}
        />
        <TraditionRow
          id="orthodox"
          label={t('traditionOrthodox', lang)}
          selected={tradition === 'orthodox'}
          onPress={() => setTradition('orthodox')}
        />
      </View>

      <Button label={t('continueLabel', lang)} onPress={() => router.push('/(onboarding)/reminder')} />
    </ScrollView>
  );
}

function TraditionRow({
  label,
  selected = false,
  onPress,
}: {
  id: Tradition;
  label: string;
  selected?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={{
        backgroundColor: colors.surfaceContainerLowest,
        borderWidth: 1,
        borderColor: selected ? colors.gold : colors.outlineVariant,
        borderRadius: radius.lg,
        borderCurve: 'continuous',
        padding: spacing.stackMd,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.gutter,
      }}
    >
      <View style={{ flex: 1 }}>
        <ThemedText variant="headlineSm" color="primary">
          {label}
        </ThemedText>
      </View>
      {selected ? <CheckIcon color={colors.secondary} /> : null}
    </Pressable>
  );
}
