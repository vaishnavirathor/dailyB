import { File, Paths } from 'expo-file-system';
import { useFocusEffect, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useCallback, useState } from 'react';
import { Pressable, View } from 'react-native';

import { Card } from '@/components/card';
import { ChevronRightIcon, PenIcon, ShareIcon } from '@/components/icons';
import { Screen } from '@/components/screen';
import { ScreenHeader } from '@/components/screen-header';
import { ThemedText } from '@/components/themed-text';
import { listJournalEntries, type JournalEntry } from '@/data/journal';
import { fromDateKey } from '@/domain/dates';
import { months, t } from '@/i18n';
import { useLanguage } from '@/stores/settings';
import { colors, spacing, type Lang } from '@/theme';

/** The private prayer journal — local only, never synced anywhere. */
export default function JournalScreen() {
  const router = useRouter();
  const lang = useLanguage();
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  // Backup: the journal lives only on this phone — let people keep it.
  const exportJournal = async () => {
    try {
      const body = entries
        .map((entry) => `${entry.entryDate}\n${entry.body}`)
        .join('\n\n---\n\n');
      const file = new File(Paths.cache, 'daily-bread-journal.txt');
      if (file.exists) {
        file.delete();
      }
      file.write(`Daily Bread · దినసరి ఆహారం — Prayer Journal\n\n${body}\n`);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, { mimeType: 'text/plain' });
      }
    } catch (error) {
      console.warn('[journal] export failed', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      let active = true;
      void listJournalEntries().then((all) => {
        if (active) {
          setEntries(all);
        }
      });
      return () => {
        active = false;
      };
    }, []),
  );

  return (
    <Screen gap={spacing.stackMd}>
      <ScreenHeader
        menu
        eyebrow={t('sectionLibrary', lang)}
        title={t('journal', lang)}
        accessory={
          entries.length > 0 && process.env.EXPO_OS !== 'web' ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => void exportJournal()}
              hitSlop={10}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
            >
              <ShareIcon size={18} color={colors.secondary} />
              <ThemedText variant="labelMd" color="secondary">
                {t('exportLabel', lang)}
              </ThemedText>
            </Pressable>
          ) : undefined
        }
      />

      <Card padding={0}>
        {entries.length === 0 ? (
          <View style={{ padding: spacing.stackMd, alignItems: 'center', gap: 8 }}>
            <PenIcon color={colors.outline} />
            <ThemedText variant="bodySm" color="onSurfaceVariant" align="center">
              {t('journalEmpty', lang)}
            </ThemedText>
          </View>
        ) : (
          entries.map((entry, i) => (
            <Pressable
              key={entry.id}
              accessibilityRole="button"
              onPress={() =>
                router.push({ pathname: '/journal/[id]', params: { id: String(entry.id) } })
              }
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.gutter,
                padding: spacing.gutter,
                borderTopWidth: i === 0 ? 0 : 1,
                borderTopColor: colors.surfaceContainerHigh,
              }}
            >
              <View style={{ flex: 1, gap: 2 }}>
                <ThemedText variant="bodyMd" color="primary" numberOfLines={1}>
                  {entry.body}
                </ThemedText>
                <ThemedText variant="labelMd" color="onSurfaceVariant">
                  {formatEntryDate(entry.entryDate, lang)}
                </ThemedText>
              </View>
              <ChevronRightIcon size={18} color={colors.outline} />
            </Pressable>
          ))
        )}
      </Card>
    </Screen>
  );
}

function formatEntryDate(dateKey: string, lang: Lang): string {
  const d = fromDateKey(dateKey);
  const month = months[lang][d.getMonth()];
  return lang === 'te'
    ? `${d.getDate()} ${month} ${d.getFullYear()}`
    : `${month} ${d.getDate()}, ${d.getFullYear()}`;
}
