import { useMemo, useRef, useState } from 'react';
import { Pressable, TextInput, View, useWindowDimensions } from 'react-native';

import { Button } from '@/components/button';
import { Screen } from '@/components/screen';
import { ScreenHeader } from '@/components/screen-header';
import { ThemedText } from '@/components/themed-text';
import { getContentRepository } from '@/content/bundled';
import { festivalCard, festivalCards, type FestivalId } from '@/content/bundled/festivals';
import { diffDays } from '@/domain/dates';
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  ShareCanvas,
  type ShareAspect,
  type ShareStyle,
  type ShareTemplate,
} from '@/features/share/share-canvas';
import { sceneIds, type SceneId } from '@/features/share/scenes';
import { t, type StringKey } from '@/i18n';
import { captureAndShare } from '@/services/share-capture';
import { useProgress } from '@/stores/progress';
import { useLanguage, useSettings } from '@/stores/settings';
import { colors, radius, spacing, textStyle } from '@/theme';

type PresetId = 'peaceful' | 'bold' | 'elegant' | 'graceful';

interface Preset {
  id: PresetId;
  emoji: string;
  label: StringKey;
  template: ShareTemplate;
  style: ShareStyle;
  scene: SceneId | null;
}

const presets: Preset[] = [
  { id: 'peaceful', emoji: '🌿', label: 'presetPeaceful', template: 'verse', style: 'nature', scene: 'leaves' },
  { id: 'bold', emoji: '✨', label: 'presetBold', template: 'promise', style: 'classic', scene: null },
  { id: 'elegant', emoji: '👑', label: 'presetElegant', template: 'morning', style: 'rich', scene: 'stars' },
  { id: 'graceful', emoji: '🕊️', label: 'presetGraceful', template: 'verse', style: 'quote', scene: null },
];

const STYLE_META: Record<ShareStyle, { swatch: string[]; icon: string }> = {
  classic: { swatch: ['#e7e9df', '#faf9f5', '#ffffff'], icon: '+' },
  quote: { swatch: ['#fcfaf7', '#fcfaf7', '#f0ede6'], icon: '❝' },
  nature: { swatch: ['#eef0e4', '#dde0cc', '#c5caa8'], icon: '🌿' },
  minimal: { swatch: ['#ffffff', '#ffffff', '#f4f4f0'], icon: '·' },
  rich: { swatch: ['#031632', '#1a2b48', '#2a3b58'], icon: '✦' },
};

const STYLE_DEFAULT_SCENE: Record<ShareStyle, SceneId | null> = {
  classic: null,
  quote: null,
  nature: 'leaves',
  minimal: null,
  rich: 'stars',
};

export default function ShareScreen() {
  const lang = useLanguage();
  const tradition = useSettings((s) => s.tradition);
  const todayKey = useProgress((s) => s.todayKey);
  const { width } = useWindowDimensions();

  const suggestedFestival = useMemo<FestivalId | null>(() => {
    const repo = getContentRepository();
    const year = Number(todayKey.slice(0, 4));
    const map: Record<string, FestivalId> = {
      christmas: 'christmas',
      easter: 'easter',
      goodFriday: 'goodfriday',
    };
    for (const feast of repo.feastsForYear(year, tradition)) {
      const mapped = map[feast.id];
      const distance = diffDays(todayKey, feast.date);
      if (mapped && distance >= -1 && distance <= 3) {
        return mapped;
      }
    }
    return null;
  }, [todayKey, tradition]);

  const [template, setTemplate] = useState<ShareTemplate>(
    suggestedFestival ? 'festival' : 'verse',
  );
  const [festival, setFestival] = useState<FestivalId>(suggestedFestival ?? 'feast');
  const [style, setStyle] = useState<ShareStyle>('classic');
  const [aspect, setAspect] = useState<ShareAspect>('status');
  const [fromName, setFromName] = useState('');
  const [scene, setScene] = useState<SceneId | null>(null);
  const [sceneTouched, setSceneTouched] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [failed, setFailed] = useState(false);
  const canvasRef = useRef<View>(null);

  const repo = getContentRepository();
  const verse = repo.verseFor(todayKey);
  const promise = repo.promiseFor(todayKey);
  const fest = festivalCard(festival);

  const isFestival = template === 'festival';
  const content = isFestival ? fest.verse : template === 'promise' ? promise : verse;
  const kicker = t(template === 'promise' ? 'dailyPromise' : 'verseOfTheDay', lang);
  const greeting = isFestival ? fest.greeting[lang] : t('goodMorning', lang);

  const previewWidth = width - spacing.containerMargin * 2;
  const previewScale = previewWidth / CANVAS_WIDTH;
  const previewHeight = CANVAS_HEIGHT[aspect] * previewScale;

  const canvasProps = {
    template,
    aspect,
    lang,
    style,
    kicker,
    text: content.text,
    reference: content.reference,
    greeting,
    fromName: isFestival ? fromName : undefined,
    fromLabel: t('withPrayers', lang),
    scene,
  } as const;

  const share = async () => {
    setSharing(true);
    setFailed(false);
    try {
      await captureAndShare(canvasRef);
    } catch (error) {
      console.warn('[share] failed', error);
      setFailed(true);
    } finally {
      setSharing(false);
    }
  };

  const pickStyle = (s: ShareStyle) => {
    setStyle(s);
    if (!sceneTouched) {
      setScene(STYLE_DEFAULT_SCENE[s]);
    }
  };

  const applyPreset = (preset: Preset) => {
    setTemplate(preset.template);
    setStyle(preset.style);
    setScene(preset.scene);
    setSceneTouched(false);
  };

  const templates: { id: ShareTemplate; label: StringKey }[] = [
    { id: 'verse', label: 'templateVerse' },
    { id: 'promise', label: 'templatePromise' },
    { id: 'morning', label: 'templateMorning' },
    { id: 'festival', label: 'templateFestival' },
  ];

  const nameInputStyle = textStyle('bodyMd', lang);

  return (
    <Screen gap={spacing.stackMd}>
      <ScreenHeader menu eyebrow={t('tabShare', lang)} title={t('shareTitle', lang)} />

      {/* Quick presets — one-tap mood cards */}
      <View style={{ flexDirection: 'row', gap: spacing.stackSm - 4 }}>
        {presets.map((p) => (
          <Pressable
            key={p.id}
            accessibilityRole="button"
            onPress={() => applyPreset(p)}
            style={{
              flex: 1,
              alignItems: 'center',
              gap: 3,
              paddingVertical: spacing.stackSm,
              borderRadius: radius.base,
              borderCurve: 'continuous',
              borderWidth: 1,
              borderColor: colors.outlineVariant,
              backgroundColor: colors.surfaceContainerLowest,
            }}
          >
            <ThemedText variant="bodyLg">{p.emoji}</ThemedText>
            <ThemedText variant="labelSm" color="onSurfaceVariant" numberOfLines={1}>
              {t(p.label, lang)}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      {/* Content template picker */}
      <View style={{ flexDirection: 'row', gap: spacing.stackSm - 4 }}>
        {templates.map(({ id, label }) => (
          <Selector
            key={id}
            label={t(label, lang)}
            active={template === id}
            accent={id === 'festival' ? 'clay' : 'gold'}
            onPress={() => setTemplate(id)}
          />
        ))}
      </View>

      {/* Style thumbnails — visual swatches */}
      <View style={{ flexDirection: 'row', gap: spacing.stackSm - 4 }}>
        {(Object.keys(STYLE_META) as ShareStyle[]).map((s) => {
          const meta = STYLE_META[s];
          const active = style === s;
          return (
            <Pressable
              key={s}
              accessibilityRole="button"
              onPress={() => pickStyle(s)}
              style={{ flex: 1, gap: 4, alignItems: 'center' }}
            >
              <View
                style={{
                  width: '100%',
                  height: 36,
                  borderRadius: radius.md,
                  borderCurve: 'continuous',
                  borderWidth: 2,
                  borderColor: active ? colors.gold : colors.outlineVariant,
                  overflow: 'hidden',
                  flexDirection: 'row',
                }}
              >
                {meta.swatch.map((c, i) => (
                  <View key={i} style={{ flex: 1, backgroundColor: c }} />
                ))}
              </View>
              <ThemedText
                variant="labelSm"
                color={active ? 'secondary' : 'onSurfaceVariant'}
                numberOfLines={1}
              >
                {t(`style${s.charAt(0).toUpperCase() + s.slice(1)}` as StringKey, lang)}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {/* Festival picker — always visible, dimmed when irrelevant */}
      <View style={{ gap: spacing.stackSm, opacity: isFestival ? 1 : 0.4 }}>
        <View style={{ flexDirection: 'row', gap: spacing.stackSm - 4 }}>
          {festivalCards.map((card) => (
            <Selector
              key={card.id}
              label={card.label[lang]}
              active={festival === card.id}
              accent="clay"
              onPress={() => isFestival && setFestival(card.id)}
            />
          ))}
        </View>
        {isFestival ? (
          <TextInput
            value={fromName}
            onChangeText={setFromName}
            placeholder={t('yourName', lang)}
            placeholderTextColor={colors.outline}
            maxLength={40}
            style={{
              fontFamily: nameInputStyle.fontFamily,
              fontSize: nameInputStyle.fontSize,
              lineHeight: nameInputStyle.lineHeight,
              color: colors.onSurface,
              borderBottomWidth: 1,
              borderBottomColor: colors.outlineVariant,
              paddingVertical: spacing.stackSm - 4,
            }}
          />
        ) : null}
      </View>

      {/* Live preview — dominant */}
      <View
        style={{
          width: previewWidth,
          height: previewHeight,
          borderRadius: radius.lg,
          borderCurve: 'continuous',
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: colors.outlineVariant,
          alignSelf: 'center',
        }}
      >
        <View
          style={{
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT[aspect],
            transform: [{ scale: previewScale }],
            transformOrigin: 'top left',
          }}
        >
          <ShareCanvas {...canvasProps} />
        </View>
      </View>

      {/* Secondary controls — aspect + scene */}
      <View style={{ flexDirection: 'row', gap: spacing.stackSm }}>
        <Selector
          label={t('status916', lang)}
          active={aspect === 'status'}
          onPress={() => setAspect('status')}
        />
        <Selector
          label={t('post11', lang)}
          active={aspect === 'post'}
          onPress={() => setAspect('post')}
        />
      </View>

      <View style={{ flexDirection: 'row', gap: spacing.stackSm - 4 }}>
        <Selector
          label={t('scenePlain', lang)}
          active={scene === null}
          onPress={() => { setScene(null); setSceneTouched(true); }}
        />
        {sceneIds.map((id) => (
          <Selector
            key={id}
            label={SCENE_LABEL[id].emoji}
            active={scene === id}
            onPress={() => { setScene(id); setSceneTouched(true); }}
          />
        ))}
      </View>

      {process.env.EXPO_OS === 'web' ? (
        <ThemedText variant="bodySm" color="onSurfaceVariant" align="center">
          Sharing works on the phone app — open Daily Bread in Expo Go to share.
        </ThemedText>
      ) : (
        <Button label={t('shareButton', lang)} onPress={share} disabled={sharing} />
      )}
      {failed ? (
        <ThemedText variant="bodySm" color="error" align="center">
          {t('shareFailed', lang)}
        </ThemedText>
      ) : null}

      <View style={{ position: 'absolute', left: -CANVAS_WIDTH * 2, top: 0 }} pointerEvents="none">
        <ShareCanvas ref={canvasRef} {...canvasProps} />
      </View>
    </Screen>
  );
}

const SCENE_LABEL: Record<SceneId, { emoji: string; label: StringKey }> = {
  sunrise: { emoji: '🌅', label: 'sceneSunrise' },
  leaves: { emoji: '🍃', label: 'sceneLeaves' },
  sea: { emoji: '🌊', label: 'sceneSea' },
  stars: { emoji: '✨', label: 'sceneStars' },
};

function Selector({
  label,
  active,
  onPress,
  accent = 'gold',
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  accent?: 'gold' | 'clay';
}) {
  const activeBorder = accent === 'clay' ? colors.clay : colors.gold;
  const activeText = accent === 'clay' ? colors.clay : colors.secondary;
  const activeFill = accent === 'clay' ? 'rgba(182,109,82,0.10)' : '#fffaf0';
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={{
        flex: 1,
        alignItems: 'center',
        paddingVertical: spacing.stackSm,
        paddingHorizontal: 2,
        borderRadius: radius.base,
        borderCurve: 'continuous',
        borderWidth: 1,
        borderColor: active ? activeBorder : colors.outlineVariant,
        backgroundColor: active ? activeFill : colors.surfaceContainerLowest,
      }}
    >
      <ThemedText
        variant="labelMd"
        style={{ color: active ? activeText : colors.onSurfaceVariant }}
        numberOfLines={1}
      >
        {label}
      </ThemedText>
    </Pressable>
  );
}
