import { useRouter } from 'expo-router';
import { useRef } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { CloseIcon, SproutIcon } from '@/components/icons';
import { ThemedText } from '@/components/themed-text';
import { t } from '@/i18n';
import { captureAndShare } from '@/services/share-capture';
import { useProgress } from '@/stores/progress';
import { useLanguage } from '@/stores/settings';
import { colors, fonts, radius, shadows, spacing } from '@/theme';

/**
 * Milestone Moments — warm 7/30/100-day celebrations that double as
 * shareable cards. Progress-forward; celebrated exactly once.
 */
export default function MilestoneScreen() {
  const router = useRouter();
  const lang = useLanguage();
  const insets = useSafeAreaInsets();
  const milestone = useProgress((s) => s.pendingMilestone);
  const acknowledge = useProgress((s) => s.acknowledgeMilestone);
  const cardRef = useRef<View>(null);

  const close = () => {
    acknowledge();
    if (router.canGoBack()) {
      router.back();
    }
  };

  if (milestone === null) {
    // Arrived without a pending milestone (e.g. deep link) — leave quietly.
    return (
      <View style={{ flex: 1, backgroundColor: colors.surface, justifyContent: 'center' }}>
        <Button label={t('done', lang)} onPress={close} style={{ margin: spacing.containerMargin }} />
      </View>
    );
  }

  const milestoneLabel = t(
    milestone === 7 ? 'milestone7' : milestone === 30 ? 'milestone30' : 'milestone100',
    lang,
  );

  const share = async () => {
    try {
      await captureAndShare(cardRef);
    } catch (error) {
      console.warn('[milestone] share failed', error);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.surface,
        paddingTop: insets.top + spacing.stackSm,
        padding: spacing.containerMargin,
        gap: spacing.stackMd,
      }}
    >
      <Pressable
        accessibilityRole="button"
        onPress={close}
        hitSlop={12}
        style={{ alignSelf: 'flex-end' }}
      >
        <CloseIcon color={colors.primary} />
      </Pressable>

      <View style={{ flex: 1, justifyContent: 'center', gap: spacing.stackMd }}>
        {/* The shareable card itself — captured verbatim by view-shot. */}
        <View
          ref={cardRef}
          collapsable={false}
          style={{
            backgroundColor: '#fffdf6',
            borderWidth: 1,
            borderColor: 'rgba(168,128,31,0.35)',
            borderRadius: radius.xl,
            borderCurve: 'continuous',
            padding: spacing.stackLg - 8,
            alignItems: 'center',
            gap: spacing.stackSm,
            boxShadow: shadows.verse,
          }}
        >
          <SproutIcon size={36} color={colors.sage} />
          <ThemedText
            variant="labelMd"
            color="secondary"
            style={{ textTransform: 'uppercase', letterSpacing: 2.6 }}
          >
            {t('milestoneTitle', lang)}
          </ThemedText>
          <ThemedText
            style={{
              fontFamily: fonts.serifBold,
              fontSize: 64,
              lineHeight: 76,
              color: colors.primary,
              fontVariant: ['tabular-nums'],
            }}
          >
            {milestone}
          </ThemedText>
          <ThemedText variant="headlineSm" color="primary" align="center">
            {milestoneLabel}
          </ThemedText>
          <ThemedText variant="bodyMd" color="onSurfaceVariant" align="center" style={{ fontStyle: 'italic' }}>
            {t('milestoneBody', lang)}
          </ThemedText>
          <ThemedText variant="labelSm" color="onSurfaceVariant" style={{ letterSpacing: 1.6 }}>
            DAILY BREAD · దినసరి ఆహారం
          </ThemedText>
        </View>
      </View>

      <View style={{ gap: spacing.stackSm, paddingBottom: insets.bottom }}>
        {process.env.EXPO_OS !== 'web' ? (
          <Button label={t('shareButton', lang)} onPress={share} />
        ) : null}
        <Button label={t('done', lang)} variant="secondary" onPress={close} />
      </View>
    </View>
  );
}
