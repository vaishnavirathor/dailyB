import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';

import { PlayIcon } from '@/components/icons';
import { ThemedText } from '@/components/themed-text';
import { listVoices, previewVoice, type DeviceVoice } from '@/services/tts';
import { useLanguage, useSettings } from '@/stores/settings';
import { t } from '@/i18n';
import { colors, radius, spacing, type Lang } from '@/theme';

/**
 * Per-language voice list: radio rows with a ▶ preview each — pick the
 * pastor voice that feels right. 'Device default' follows the gender
 * preference automatically.
 */
export function VoicePicker({ forLang }: { forLang: Lang }) {
  const uiLang = useLanguage();
  const chosen = useSettings((s) => (forLang === 'te' ? s.ttsVoiceTe : s.ttsVoiceEn));
  const setTtsVoice = useSettings((s) => s.setTtsVoice);
  const [voices, setVoices] = useState<DeviceVoice[] | null>(null);

  useEffect(() => {
    let active = true;
    void listVoices(forLang).then((list) => {
      if (active) {
        setVoices(list);
      }
    });
    return () => {
      active = false;
    };
  }, [forLang]);

  if (voices === null) {
    return null;
  }

  if (voices.length === 0) {
    return (
      <ThemedText variant="bodySm" color="onSurfaceVariant" style={{ padding: spacing.gutter }}>
        {t('noVoices', uiLang)}
      </ThemedText>
    );
  }

  const rows: { id: string | null; label: string }[] = [
    { id: null, label: t('deviceDefault', uiLang) },
    ...voices.map((v) => ({ id: v.id as string | null, label: v.label })),
  ];

  return (
    <View>
      {rows.map((row, index) => {
        const selected = chosen === row.id;
        return (
          <View
            key={row.id ?? 'default'}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.gutter,
              paddingVertical: spacing.stackSm,
              paddingHorizontal: spacing.gutter,
              borderTopWidth: index === 0 ? 0 : 1,
              borderTopColor: colors.surfaceContainerHigh,
            }}
          >
            <Pressable
              accessibilityRole="radio"
              onPress={() => setTtsVoice(forLang, row.id)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.gutter, flex: 1 }}
            >
              <View
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: radius.full,
                  borderWidth: 1.5,
                  borderColor: selected ? colors.gold : colors.outlineVariant,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {selected ? (
                  <View
                    style={{
                      width: 9,
                      height: 9,
                      borderRadius: radius.full,
                      backgroundColor: colors.gold,
                    }}
                  />
                ) : null}
              </View>
              <ThemedText variant="bodySm" color={selected ? 'primary' : 'onSurfaceVariant'}>
                {row.label}
              </ThemedText>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Preview"
              hitSlop={8}
              onPress={() => previewVoice(forLang, row.id)}
              style={{
                width: 30,
                height: 30,
                borderRadius: radius.full,
                backgroundColor: 'rgba(168,128,31,0.10)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PlayIcon size={14} color={colors.secondary} />
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}
