import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/button';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { deleteJournalEntry, getJournalEntry, type JournalEntry } from '@/data/journal';
import { fromDateKey } from '@/domain/dates';
import { months, t } from '@/i18n';
import { useLanguage } from '@/stores/settings';
import { spacing } from '@/theme';

/** A single private prayer — readable, deletable, never synced anywhere. */
export default function JournalEntryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const lang = useLanguage();
  const [entry, setEntry] = useState<JournalEntry | null>(null);

  useEffect(() => {
    void getJournalEntry(Number(id)).then(setEntry);
  }, [id]);

  const remove = async () => {
    if (entry) {
      await deleteJournalEntry(entry.id);
    }
    if (router.canGoBack()) {
      router.back();
    }
  };

  if (!entry) {
    return (
      <Screen>
        <View />
      </Screen>
    );
  }

  const d = fromDateKey(entry.entryDate);
  const month = months[lang][d.getMonth()];
  const dateLabel =
    lang === 'te'
      ? `${d.getDate()} ${month} ${d.getFullYear()}`
      : `${month} ${d.getDate()}, ${d.getFullYear()}`;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen gap={spacing.stackMd}>
        <ThemedText
          variant="labelMd"
          color="secondary"
          style={{ textTransform: 'uppercase', letterSpacing: 2.6 }}
        >
          {t('journal', lang)} · {dateLabel}
        </ThemedText>
        <ThemedText variant="bodyLg" color="onSurface" selectable>
          {entry.body}
        </ThemedText>
        <Button label={t('delete', lang)} variant="secondary" onPress={() => void remove()} />
      </Screen>
    </>
  );
}
