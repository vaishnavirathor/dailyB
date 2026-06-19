import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Switch, View } from 'react-native';

import { Card } from '@/components/card';
import { GearIcon, PlayIcon, TypeIcon } from '@/components/icons';
import { Screen } from '@/components/screen';
import { ScreenHeader } from '@/components/screen-header';
import { ThemedText } from '@/components/themed-text';
import { VoicePicker } from '@/features/settings/voice-picker';
import { t } from '@/i18n';
import { requestNotificationPermission } from '@/services/notifications';
import { isTtsAvailable } from '@/services/tts';
import { smartSpeak } from '@/services/voice';
import {
  useLanguage,
  useSettings,
  type FontScale,
  type HdVoiceProvider,
  type Tradition,
  type VoiceGender,
} from '@/stores/settings';
import { colors, radius, spacing, teluguFontMap, englishHeadingFontMap, englishBodyFontMap, type Lang } from '@/theme';

export default function SettingsScreen() {
  const lang = useLanguage();
  const settings = useSettings();
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [ttsOk, setTtsOk] = useState(true);
  const isWeb = process.env.EXPO_OS === 'web';

  useEffect(() => {
    void isTtsAvailable(lang).then(setTtsOk);
  }, [lang]);

  const toggleReminder = async (enabled: boolean) => {
    if (enabled) {
      const granted = await requestNotificationPermission();
      settings.setNotificationsEnabled(granted);
    } else {
      settings.setNotificationsEnabled(false);
    }
  };

  const pickerValue = new Date();
  pickerValue.setHours(settings.reminderTime.hour, settings.reminderTime.minute, 0, 0);

  const fontScales: { id: FontScale; label: string }[] = [
    { id: 'normal', label: t('textSizeNormal', lang) },
    { id: 'large', label: t('textSizeLarge', lang) },
    { id: 'xl', label: t('textSizeXl', lang) },
  ];

  return (
    <Screen gap={spacing.stackMd}>
      <ScreenHeader menu eyebrow={t('sectionApp', lang)} title={t('settings', lang)} />

      {/* General */}
      <SectionCard icon={GearIcon} title="General">
        <Row label={t('language', lang)}>
          <Segmented
            options={[
              { id: 'te', label: 'తెలుగు' },
              { id: 'en', label: 'English' },
            ]}
            value={settings.language}
            onChange={(v) => settings.setLanguage(v as Lang)}
          />
        </Row>

        {!isWeb ? (
          <>
            <Row label={t('reminder', lang)} divider>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.stackSm }}>
                {settings.notificationsEnabled ? (
                  <Pressable accessibilityRole="button" onPress={() => setShowTimePicker(true)}>
                    <ThemedText variant="bodyMd" color="secondary">
                      {formatTime(settings.reminderTime.hour, settings.reminderTime.minute)}
                    </ThemedText>
                  </Pressable>
                ) : (
                  <ThemedText variant="bodySm" color="onSurfaceVariant">
                    {t('reminderOff', lang)}
                  </ThemedText>
                )}
                <Switch
                  value={settings.notificationsEnabled}
                  onValueChange={(v) => void toggleReminder(v)}
                  trackColor={{ true: colors.sage, false: colors.surfaceContainerHighest }}
                  thumbColor={colors.surfaceContainerLowest}
                />
              </View>
            </Row>
            {showTimePicker ? (
              <DateTimePicker
                value={pickerValue}
                mode="time"
                display={process.env.EXPO_OS === 'ios' ? 'spinner' : 'default'}
                onChange={(_event, date) => {
                  if (_event.type === 'dismissed') {
                    setShowTimePicker(false);
                    return;
                  }
                  if (process.env.EXPO_OS === 'android') {
                    setShowTimePicker(false);
                  }
                  if (date) settings.setReminderTime({ hour: date.getHours(), minute: date.getMinutes() });
                }}
              />
            ) : null}
          </>
        ) : null}

        <Row label={t('textSize', lang)} divider>
          <Segmented
            options={fontScales.map((f) => ({ id: f.id, label: f.label }))}
            value={settings.fontScale}
            onChange={(v) => settings.setFontScale(v as FontScale)}
          />
        </Row>

        <Row label={t('curtainSetting', lang)} divider>
          <Switch
            value={settings.curtainEnabled}
            onValueChange={(v) => settings.setCurtainEnabled(v)}
            trackColor={{ true: colors.sage, false: colors.surfaceContainerHighest }}
            thumbColor={colors.surfaceContainerLowest}
          />
        </Row>

        <Row label={t('tradition', lang)} divider>
          <Segmented
            options={[
              { id: 'protestant', label: t('traditionProtestantShort', lang) },
              { id: 'catholic', label: t('traditionCatholicShort', lang) },
              { id: 'orthodox', label: t('traditionOrthodoxShort', lang) },
            ]}
            value={settings.tradition}
            onChange={(v) => settings.setTradition(v as Tradition)}
          />
        </Row>
      </SectionCard>

      {/* Appearance */}
      <SectionCard icon={TypeIcon} title="Typography">
        <Row label="Telugu heading">
          <FontPicker
            options={Object.entries(teluguFontMap).map(([key, f]) => ({ key, label: f.label, family: f.family }))}
            selected={settings.teluguHeadingFont}
            onSelect={(family) => settings.setTeluguHeadingFont(family)}
          />
        </Row>
        <Row label="Telugu body" divider>
          <FontPicker
            options={Object.entries(teluguFontMap).map(([key, f]) => ({ key, label: f.label, family: f.family }))}
            selected={settings.teluguBodyFont}
            onSelect={(family) => settings.setTeluguBodyFont(family)}
          />
        </Row>
        <Row label="English heading" divider>
          <FontPicker
            options={Object.entries(englishHeadingFontMap).map(([key, f]) => ({ key, label: f.label, family: f.family }))}
            selected={settings.englishHeadingFont}
            onSelect={(family) => settings.setEnglishHeadingFont(family)}
          />
        </Row>
        <Row label="English body" divider>
          <FontPicker
            options={Object.entries(englishBodyFontMap).map(([key, f]) => ({ key, label: f.label, family: f.family }))}
            selected={settings.englishBodyFont}
            onSelect={(family) => settings.setEnglishBodyFont(family)}
          />
        </Row>
      </SectionCard>

      {/* Voice */}
      <SectionCard icon={PlayIcon} title={t('readAloudSection', lang)}>
        <Row label={t('readAloudSection', lang)}>
          <Segmented
            options={[
              { id: 'auto', label: t('voiceAuto', lang) },
              { id: 'female', label: t('voiceFemale', lang) },
              { id: 'male', label: t('voiceMale', lang) },
            ]}
            value={settings.ttsGender}
            onChange={(v) => settings.setTtsGender(v as VoiceGender)}
          />
        </Row>

        <Row label={t('hdVoice', lang)} divider>
          <Switch
            value={settings.hdVoiceEnabled}
            onValueChange={(v) => settings.setHdVoiceEnabled(v)}
            trackColor={{ true: colors.sage, false: colors.surfaceContainerHighest }}
            thumbColor={colors.surfaceContainerLowest}
          />
        </Row>
        {settings.hdVoiceEnabled ? (
          <>
            <Row label="" divider>
              <Segmented
                options={[
                  { id: 'azure', label: t('hdProviderAzure', lang) },
                  { id: 'sarvam', label: t('hdProviderSarvam', lang) },
                  { id: 'elevenlabs', label: t('hdProviderEleven', lang) },
                ]}
                value={settings.hdProvider}
                onChange={(v) => settings.setHdProvider(v as HdVoiceProvider)}
              />
            </Row>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: spacing.gutter,
                paddingBottom: spacing.stackSm,
                gap: spacing.gutter,
              }}
            >
              <ThemedText variant="labelMd" color="onSurfaceVariant" style={{ flex: 1 }}>
                {t('hdVoiceNote', lang)}
              </ThemedText>
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  void smartSpeak(
                    lang === 'te'
                      ? 'యెహోవా నా కాపరి; నాకు లేమి కలుగదు.'
                      : 'The Lord is my shepherd; I shall not want.',
                    lang,
                  )
                }
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  backgroundColor: 'rgba(168,128,31,0.12)',
                  borderRadius: radius.full,
                  paddingVertical: 8,
                  paddingHorizontal: 14,
                }}
              >
                <ThemedText variant="labelMd" color="secondary">▶ HD</ThemedText>
              </Pressable>
            </View>
          </>
        ) : null}
        <ExpandRow label={t('teluguVoice', lang)}>
          <VoicePicker forLang="te" />
        </ExpandRow>
        <ExpandRow label={t('englishVoice', lang)}>
          <VoicePicker forLang="en" />
        </ExpandRow>
      </SectionCard>

      {!ttsOk && lang === 'te' && !isWeb ? (
        <Card tone="cream" padding={spacing.gutter}>
          <ThemedText variant="bodySm" color="onSurfaceVariant">
            🔊 {t('ttsUnavailable', lang)}
          </ThemedText>
        </Card>
      ) : null}
    </Screen>
  );
}

/** Section card with an icon header. */
function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <Card padding={0} style={{ overflow: 'hidden' }}>
      <Pressable
        accessibilityRole="button"
        onPress={() => setOpen((v) => !v)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.stackSm,
          paddingHorizontal: spacing.gutter,
          paddingVertical: spacing.stackSm,
          backgroundColor: colors.surfaceContainerLow,
        }}
      >
        <Icon size={16} color={colors.navyMuted} />
        <View style={{ flex: 1 }}>
          <ThemedText variant="labelMd" color="primary" style={{ fontWeight: '600' }}>
            {title}
          </ThemedText>
        </View>
        <ThemedText variant="labelMd" color="onSurfaceVariant">
          {open ? '▾' : '▸'}
        </ThemedText>
      </Pressable>
      {open ? <View style={{ paddingBottom: spacing.stackSm }}>{children}</View> : null}
    </Card>
  );
}

function Row({
  label,
  children,
  divider = false,
}: {
  label: string;
  children: React.ReactNode;
  divider?: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: spacing.gutter,
        padding: spacing.gutter,
        borderTopWidth: divider ? 1 : 0,
        borderTopColor: colors.surfaceContainerHigh,
      }}
    >
      {label ? (
        <ThemedText variant="bodySm" color="onSurfaceVariant" style={{ flexShrink: 0, minWidth: 80 }}>
          {label}
        </ThemedText>
      ) : null}
      <View style={{ flex: 1, alignItems: 'flex-end' }}>
        {children}
      </View>
    </View>
  );
}

function Segmented({
  options,
  value,
  onChange,
}: {
  options: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: colors.surfaceContainer,
        borderRadius: radius.base,
        borderCurve: 'continuous',
        padding: 3,
        gap: 2,
      }}
    >
      {options.map((option) => {
        const active = option.id === value;
        return (
          <Pressable
            key={option.id}
            accessibilityRole="button"
            onPress={() => onChange(option.id)}
            style={{
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: radius.base - 2,
              borderCurve: 'continuous',
              backgroundColor: active ? colors.surfaceContainerLowest : 'transparent',
            }}
          >
            <ThemedText
              variant="labelSm"
              style={{ color: active ? colors.primary : colors.onSurfaceVariant, fontWeight: active ? '600' : '400' }}
            >
              {option.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

function formatTime(hour: number, minute: number): string {
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:${String(minute).padStart(2, '0')} ${hour < 12 ? 'AM' : 'PM'}`;
}

/** Horizontal-scrolling font pill picker — never wraps. */
function FontPicker({
  options,
  selected,
  onSelect,
}: {
  options: { key: string; label: string; family: string }[];
  selected: string;
  onSelect: (family: string) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 6 }}
      style={{ maxWidth: 220 }}
    >
      {options.map((opt) => {
        const active = opt.family === selected;
        return (
          <Pressable
            key={opt.key}
            accessibilityRole="button"
            onPress={() => onSelect(opt.family)}
            style={{
              paddingVertical: 4,
              paddingHorizontal: 10,
              borderRadius: radius.full,
              backgroundColor: active ? colors.sage : colors.surfaceContainer,
            }}
          >
            <ThemedText
              variant="labelSm"
              style={{
                color: active ? '#ffffff' : colors.onSurfaceVariant,
                fontWeight: active ? '600' : '400',
              }}
            >
              {opt.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function ExpandRow({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ borderTopWidth: 1, borderTopColor: colors.surfaceContainerHigh }}>
      <Pressable
        accessibilityRole="button"
        onPress={() => setOpen((v) => !v)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: spacing.gutter,
        }}
      >
        <ThemedText variant="bodyMd" color="primary">
          {label}
        </ThemedText>
        <ThemedText variant="labelMd" color="onSurfaceVariant">
          {open ? '▴' : '▾'}
        </ThemedText>
      </Pressable>
      {open ? <View style={{ paddingHorizontal: spacing.gutter, paddingBottom: spacing.stackSm }}>{children}</View> : null}
    </View>
  );
}
