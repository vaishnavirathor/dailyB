import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, TextInput, View } from 'react-native';

import { Button } from '@/components/button';
import { ThemedText } from '@/components/themed-text';
import { getContentRepository } from '@/content/bundled';
import { addJournalEntry } from '@/data/journal';
import { t } from '@/i18n';
import { useProgress } from '@/stores/progress';
import { useLanguage, useSettings } from '@/stores/settings';
import { colors, spacing, textStyle } from '@/theme';

/**
 * One-Tap Prayer — the formSheet that closes the daily loop: the day's
 * guided prayer, an optional private journal line, and Amen.
 */
export default function PrayerSheet() {
  const router = useRouter();
  const lang = useLanguage();
  const englishHeadingFont = useSettings((s) => s.englishHeadingFont);
  const englishBodyFont = useSettings((s) => s.englishBodyFont);
  const todayKey = useProgress((s) => s.todayKey);
  const reflection = getContentRepository().reflectionFor(todayKey);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const amen = async () => {
    setSaving(true);
    try {
      const progress = useProgress.getState();
      await progress.recordReflectionRead();
      await progress.recordPrayed();
      const body = note.trim();
      if (body.length > 0) {
        await addJournalEntry(todayKey, body);
      }
    } catch (error) {
      console.warn('[prayer] failed to record', error);
    } finally {
      setSaving(false);
      if (router.canGoBack()) {
        router.back();
      }
    }
  };

  const isEnglish = lang === 'en';
  const fontOverrides = isEnglish
    ? { heading: englishHeadingFont, body: englishBodyFont }
    : undefined;
  const inputStyle = textStyle('bodyMd', lang, fontOverrides);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.surface }}
      contentContainerStyle={{
        padding: spacing.containerMargin,
        paddingTop: spacing.stackLg,
        paddingBottom: spacing.stackLg,
        gap: spacing.stackMd,
      }}
      keyboardShouldPersistTaps="handled"
    >
      <ThemedText
        variant="labelMd"
        color="secondary"
        align="center"
        style={{ textTransform: 'uppercase', letterSpacing: 2.6 }}
      >
        {t('guidedPrayerTitle', lang)}
      </ThemedText>

      <ThemedText variant="bodyLg" color="primary" align="center" style={{ fontStyle: 'italic' }}>
        {reflection.prayer[lang]}
      </ThemedText>

      <View style={{ gap: 6, marginTop: spacing.stackSm }}>
        {/* Bottom-border input per the design system — airy, not boxed. */}
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder={t('journalPlaceholder', lang)}
          placeholderTextColor={colors.outline}
          multiline
          style={{
            fontFamily: inputStyle.fontFamily,
            fontSize: inputStyle.fontSize,
            lineHeight: inputStyle.lineHeight,
            color: colors.onSurface,
            borderBottomWidth: 1,
            borderBottomColor: colors.outlineVariant,
            paddingVertical: spacing.stackSm,
            minHeight: 72,
            textAlignVertical: 'top',
          }}
        />
      </View>

      <Button label={`🙏 ${t('amen', lang)}`} onPress={amen} disabled={saving} />
    </ScrollView>
  );
}
