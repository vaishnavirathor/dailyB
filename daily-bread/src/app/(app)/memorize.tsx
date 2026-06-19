import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

import { Card } from '@/components/card';
import { Screen } from '@/components/screen';
import { ScreenHeader } from '@/components/screen-header';
import { ThemedText } from '@/components/themed-text';
import { getContentRepository } from '@/content/bundled';
import { listFavorites } from '@/data/favorites';
import {
  blankVerse,
  hiddenSequence,
  wordBank,
  type MemorizeLevel,
  type Token,
} from '@/domain/memorize';
import { t } from '@/i18n';
import { useProgress } from '@/stores/progress';
import { useLanguage } from '@/stores/settings';
import { colors, radius, spacing, tints } from '@/theme';

interface PracticeItem {
  refId: string;
  text: string;
  reference: string;
}

/**
 * Verse memorization — fill the blanks from a shuffled word bank.
 * Three gentle levels: a third hidden → two-thirds → the whole verse.
 */
export default function MemorizeScreen() {
  const lang = useLanguage();
  const todayKey = useProgress((s) => s.todayKey);
  const [items, setItems] = useState<PracticeItem[]>([]);
  const [active, setActive] = useState<PracticeItem | null>(null);
  const [level, setLevel] = useState<MemorizeLevel>(1);
  const [round, setRound] = useState(0); // reshuffles the seed

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      const verse = getContentRepository().verseFor(todayKey);
      void listFavorites().then((favorites) => {
        if (!alive) {
          return;
        }
        const fromFavorites = favorites
          .filter((f) => f.kind !== 'hymn')
          .map((f) => ({ refId: f.refId, text: f.payload.text, reference: f.payload.reference }));
        setItems([
          { refId: `today:${verse.id}`, text: verse.text[lang], reference: verse.reference[lang] },
          ...fromFavorites,
        ]);
      });
      return () => {
        alive = false;
      };
    }, [todayKey, lang]),
  );

  if (active) {
    return (
      <Practice
        item={active}
        level={level}
        seed={round * 1000 + level}
        onLevelUp={() => setLevel((l) => (l < 3 ? ((l + 1) as MemorizeLevel) : l))}
        onAgain={() => setRound((r) => r + 1)}
        onBack={() => {
          setActive(null);
          setLevel(1);
        }}
      />
    );
  }

  return (
    <Screen gap={spacing.stackMd}>
      <ScreenHeader menu eyebrow={t('sectionLibrary', lang)} title={t('memorize', lang)} />
      <ThemedText variant="bodySm" color="onSurfaceVariant">
        {t('chooseVerse', lang)}
      </ThemedText>
      {items.length <= 1 ? (
        <ThemedText variant="bodySm" color="onSurfaceVariant" align="center">
          {t('memorizeEmpty', lang)}
        </ThemedText>
      ) : null}
      {items.map((item) => (
        <Pressable
          key={item.refId}
          accessibilityRole="button"
          onPress={() => {
            setActive(item);
            setLevel(1);
            setRound((r) => r + 1);
          }}
        >
          <Card padding={spacing.gutter} style={{ gap: 4 }}>
            <ThemedText variant="bodyMd" color="primary" numberOfLines={2} lang="te">
              {item.text}
            </ThemedText>
            <ThemedText variant="labelMd" color="onSurfaceVariant">
              {item.reference}
            </ThemedText>
          </Card>
        </Pressable>
      ))}
    </Screen>
  );
}

function Practice({
  item,
  level,
  seed,
  onLevelUp,
  onAgain,
  onBack,
}: {
  item: PracticeItem;
  level: MemorizeLevel;
  seed: number;
  onLevelUp: () => void;
  onAgain: () => void;
  onBack: () => void;
}) {
  const lang = useLanguage();
  const tokens = useMemo<Token[]>(() => blankVerse(item.text, level, seed), [item.text, level, seed]);
  const sequence = useMemo(() => hiddenSequence(tokens), [tokens]);
  const bank = useMemo(() => wordBank(tokens, seed), [tokens, seed]);
  // Each hidden token's ordinal among the blanks (compiler-safe derivation).
  const ordinals = useMemo(() => {
    const result: number[] = [];
    let n = -1;
    for (const token of tokens) {
      n += token.hidden ? 1 : 0;
      result.push(token.hidden ? n : -1);
    }
    return result;
  }, [tokens]);

  const [filled, setFilled] = useState(0); // how many blanks are solved
  const [used, setUsed] = useState<Set<number>>(new Set()); // bank indices consumed
  const [wrong, setWrong] = useState<number | null>(null);

  const done = filled === sequence.length;

  const pick = (bankIndex: number) => {
    if (used.has(bankIndex) || done) {
      return;
    }
    if (bank[bankIndex] === sequence[filled]) {
      setUsed((previous) => new Set(previous).add(bankIndex));
      setFilled((f) => f + 1);
      setWrong(null);
    } else {
      setWrong(bankIndex);
      setTimeout(() => setWrong(null), 450);
    }
  };

  return (
    <Screen gap={spacing.stackMd}>
      <ScreenHeader
        menu
        eyebrow={`${t('memorize', lang)} · ${t('levelWord', lang)} ${level}/3`}
        title={item.reference}
      />

      <Card padding={spacing.stackMd} style={{ gap: spacing.stackSm }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
          {tokens.map((token, i) => {
            if (token.hidden) {
              const solved = ordinals[i] < filled;
              return (
                <View
                  key={i}
                  style={{
                    backgroundColor: solved ? tints.dailyLoop : colors.surfaceContainerHigh,
                    borderRadius: radius.sm,
                    paddingVertical: 3,
                    paddingHorizontal: solved ? 6 : 14,
                    minWidth: 36,
                  }}
                >
                  <ThemedText variant="bodyLg" lang="te" style={{ color: solved ? colors.sage : 'transparent' }}>
                    {solved ? token.word : '–'}
                  </ThemedText>
                </View>
              );
            }
            return (
              <ThemedText key={i} variant="bodyLg" lang="te" color="primary">
                {token.word}
              </ThemedText>
            );
          })}
        </View>
      </Card>

      {done ? (
        <View style={{ gap: spacing.stackSm, alignItems: 'center' }}>
          <ThemedText variant="headlineSm" color="success">
            {t('wellDone', lang)}
          </ThemedText>
          <View style={{ flexDirection: 'row', gap: spacing.stackSm }}>
            {level < 3 ? (
              <Pill label={`${t('levelWord', lang)} ${level + 1} →`} onPress={onLevelUp} primary />
            ) : null}
            <Pill label="↻" onPress={onAgain} />
            <Pill label="←" onPress={onBack} />
          </View>
        </View>
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.stackSm - 4 }}>
          {bank.map((word, i) => {
            const consumed = used.has(i);
            return (
              <Pressable
                key={i}
                accessibilityRole="button"
                disabled={consumed}
                onPress={() => pick(i)}
                style={{
                  backgroundColor: consumed
                    ? colors.surfaceContainerLow
                    : wrong === i
                      ? 'rgba(186,26,26,0.12)'
                      : colors.surfaceContainerLowest,
                  borderWidth: 1,
                  borderColor: wrong === i ? colors.error : colors.outlineVariant,
                  borderRadius: radius.base,
                  borderCurve: 'continuous',
                  paddingVertical: 8,
                  paddingHorizontal: 14,
                  opacity: consumed ? 0.35 : 1,
                }}
              >
                <ThemedText variant="bodyMd" lang="te" color="primary">
                  {word}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      )}
    </Screen>
  );
}

function Pill({ label, onPress, primary = false }: { label: string; onPress: () => void; primary?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={{
        backgroundColor: primary ? colors.primary : colors.surfaceContainerLowest,
        borderWidth: primary ? 0 : 1,
        borderColor: colors.outlineVariant,
        borderRadius: radius.full,
        paddingVertical: 10,
        paddingHorizontal: 18,
      }}
    >
      <ThemedText variant="labelMd" style={{ color: primary ? colors.secondaryContainer : colors.primary }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}
