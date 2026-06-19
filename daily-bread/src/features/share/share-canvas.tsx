import { LinearGradient } from 'expo-linear-gradient';
import { forwardRef } from 'react';
import { Text, View } from 'react-native';

import { CrossIcon } from '@/components/icons';
import type { Localized } from '@/content/types';
import {
  CornerFlourishes,
  DividerLine,
  MinimalBorder,
  QuoteMarks,
  RichBorder,
  Scene,
  type SceneId,
} from '@/features/share/scenes';
import { colors, fonts, type Lang } from '@/theme';

export type ShareTemplate = 'verse' | 'promise' | 'morning' | 'festival';
export type ShareAspect = 'status' | 'post';
export type ShareStyle = 'classic' | 'quote' | 'nature' | 'minimal' | 'rich';

/** Design size in dp; captured at width 1080 for export. */
export const CANVAS_WIDTH = 540;
export const CANVAS_HEIGHT: Record<ShareAspect, number> = {
  status: 960,
  post: 540,
};

export interface ShareCanvasProps {
  template: ShareTemplate;
  aspect: ShareAspect;
  lang: Lang;
  style: ShareStyle;
  kicker: string;
  text: Localized;
  reference: Localized;
  greeting?: string;
  fromName?: string;
  fromLabel?: string;
  scene?: SceneId | null;
}

const gradients: Record<ShareTemplate, readonly [string, string, string]> = {
  verse: ['#e7e9df', '#faf9f5', '#ffffff'],
  promise: ['#f4e9cf', '#fdf8ec', '#ffffff'],
  morning: ['#f6e3c8', '#faf3e3', '#fffdf6'],
  festival: ['#f2ddd3', '#fbf3ee', '#fffdf9'],
};

/* ─── Classic render (existing) ─── */

function ClassicCard({
  height,
  aspect,
  isTelugu,
  body,
  scene,
  template,
  isOccasion,
  greeting,
  kicker,
  verseSize,
  verseLineHeight,
  reference,
  fromName,
  fromLabel,
  lang,
}: {
  height: number;
  aspect: ShareAspect;
  isTelugu: boolean;
  body: string;
  scene?: SceneId | null;
  template: ShareTemplate;
  isOccasion: boolean;
  greeting?: string;
  kicker: string;
  verseSize: number;
  verseLineHeight: number;
  reference: Localized;
  fromName?: string;
  fromLabel?: string;
  lang: Lang;
}) {
  const accent = template === 'festival' ? colors.clay : colors.gold;
  return (
    <>
      {scene ? (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
          <Scene id={scene} width={CANVAS_WIDTH} height={height} />
          <View
            style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(250,249,245,0.4)',
            }}
          />
        </View>
      ) : null}
      <LinearGradient
        colors={scene ? ['rgba(250,249,245,0)', 'rgba(250,249,245,0)', 'rgba(250,249,245,0)'] : gradients[template]}
        locations={[0, 0.55, 1]}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={{
          flex: 1,
          paddingHorizontal: 56,
          paddingVertical: aspect === 'status' ? 96 : 56,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 28,
        }}
      >
        {isOccasion && greeting ? (
          <View style={{ alignItems: 'center', gap: 18 }}>
            <CrossIcon size={30} color={accent} />
            <Text
              style={{
                fontFamily: isTelugu ? fonts.teluguBold : fonts.serifBold,
                fontSize: 38,
                lineHeight: isTelugu ? 62 : 48,
                color: accent,
                textAlign: 'center',
              }}
            >
              {greeting}
            </Text>
          </View>
        ) : (
          <View style={{ alignItems: 'center', gap: 14 }}>
            <CrossIcon size={34} color={colors.gold} />
            <Text
              style={{
                fontFamily: fonts.serifSemiBold,
                fontSize: 13,
                lineHeight: 18,
                letterSpacing: 4,
                textTransform: 'uppercase',
                color: colors.secondary,
                textAlign: 'center',
              }}
            >
              {kicker}
            </Text>
          </View>
        )}
        <Text
          style={{
            fontFamily: isTelugu ? fonts.teluguRegular : fonts.serifItalic,
            fontSize: verseSize,
            lineHeight: verseLineHeight,
            color: colors.primary,
            textAlign: 'center',
          }}
        >
          {isTelugu ? body : `"${body}"`}
        </Text>
        <Text
          style={{
            fontFamily: fonts.labelMedium,
            fontSize: 14,
            lineHeight: 20,
            letterSpacing: 2.4,
            textTransform: 'uppercase',
            color: colors.onSurfaceVariant,
            textAlign: 'center',
          }}
        >
          {reference[lang]}
        </Text>
        {fromName?.trim() ? (
          <Text
            style={{
              fontFamily: isTelugu ? fonts.teluguRegular : fonts.bodyItalic,
              fontSize: 17,
              lineHeight: isTelugu ? 30 : 24,
              color: colors.clay,
              textAlign: 'center',
            }}
          >
            {fromLabel} — {fromName.trim()}
          </Text>
        ) : null}
      </LinearGradient>
    </>
  );
}

/* ─── Quote Card ─── */

function QuoteCard({
  height,
  aspect,
  isTelugu,
  body,
  kicker,
  verseSize,
  verseLineHeight,
  reference,
  fromName,
  fromLabel,
  lang,
}: {
  height: number;
  aspect: ShareAspect;
  isTelugu: boolean;
  body: string;
  kicker: string;
  verseSize: number;
  verseLineHeight: number;
  reference: Localized;
  fromName?: string;
  fromLabel?: string;
  lang: Lang;
}) {
  return (
    <View style={{ flex: 1, backgroundColor: '#fcfaf7', paddingHorizontal: 56, paddingVertical: aspect === 'status' ? 96 : 56, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'absolute', top: aspect === 'status' ? 80 : 40 }}>
        <QuoteMarks color={colors.secondary} size={100} />
      </View>
      <View style={{ alignItems: 'center', gap: 24, marginTop: 40 }}>
        <Text
          style={{
            fontFamily: fonts.serifSemiBold,
            fontSize: 11,
            lineHeight: 16,
            letterSpacing: 3.6,
            textTransform: 'uppercase',
            color: colors.secondary,
            textAlign: 'center',
          }}
        >
          {kicker}
        </Text>
        <DividerLine color={colors.gold} />
        <Text
          style={{
            fontFamily: isTelugu ? fonts.teluguRegular : fonts.serifItalic,
            fontSize: verseSize,
            lineHeight: verseLineHeight,
            color: colors.primary,
            textAlign: 'center',
          }}
        >
          {isTelugu ? body : `"${body}"`}
        </Text>
        <DividerLine color={colors.gold} />
        <Text
          style={{
            fontFamily: fonts.labelSemiBold,
            fontSize: 13,
            lineHeight: 18,
            letterSpacing: 2,
            color: colors.onSurfaceVariant,
            textAlign: 'center',
          }}
        >
          {reference[lang]}
        </Text>
        {fromName?.trim() ? (
          <Text
            style={{
              fontFamily: isTelugu ? fonts.teluguRegular : fonts.bodyItalic,
              fontSize: 15,
              lineHeight: isTelugu ? 26 : 22,
              color: colors.clay,
              textAlign: 'center',
            }}
          >
            {fromLabel} — {fromName.trim()}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

/* ─── Nature Card ─── */

function NatureCard({
  height,
  aspect,
  isTelugu,
  body,
  scene,
  kicker,
  verseSize,
  verseLineHeight,
  reference,
  fromName,
  fromLabel,
  lang,
}: {
  height: number;
  aspect: ShareAspect;
  isTelugu: boolean;
  body: string;
  scene?: SceneId | null;
  kicker: string;
  verseSize: number;
  verseLineHeight: number;
  reference: Localized;
  fromName?: string;
  fromLabel?: string;
  lang: Lang;
}) {
  return (
    <View style={{ flex: 1 }}>
      {scene ? (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
          <Scene id={scene} width={CANVAS_WIDTH} height={height} />
          <View
            style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(250,249,245,0.3)',
            }}
          />
        </View>
      ) : (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#eef0e4' }} />
      )}
      <LinearGradient
        colors={['rgba(250,249,245,0)', 'rgba(250,249,245,0.15)', 'rgba(250,249,245,0.3)']}
        locations={[0, 0.6, 1]}
        style={{
          flex: 1,
          paddingHorizontal: 56,
          paddingVertical: aspect === 'status' ? 100 : 60,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20,
        }}
      >
        <Text
          style={{
            fontFamily: fonts.serifSemiBold,
            fontSize: 11,
            lineHeight: 16,
            letterSpacing: 3.6,
            textTransform: 'uppercase',
            color: colors.sage,
            textAlign: 'center',
          }}
        >
          {kicker}
        </Text>
        <Text
          style={{
            fontFamily: isTelugu ? fonts.teluguRegular : fonts.serifItalic,
            fontSize: verseSize,
            lineHeight: verseLineHeight,
            color: colors.primary,
            textAlign: 'center',
          }}
        >
          {isTelugu ? body : `"${body}"`}
        </Text>
        <Text
          style={{
            fontFamily: fonts.labelSemiBold,
            fontSize: 12,
            lineHeight: 17,
            letterSpacing: 1.8,
            color: colors.sage,
            textAlign: 'center',
          }}
        >
          {reference[lang]}
        </Text>
        {fromName?.trim() ? (
          <Text
            style={{
              fontFamily: isTelugu ? fonts.teluguRegular : fonts.bodyItalic,
              fontSize: 15,
              lineHeight: isTelugu ? 26 : 22,
              color: colors.clay,
              textAlign: 'center',
            }}
          >
            {fromLabel} — {fromName.trim()}
          </Text>
        ) : null}
      </LinearGradient>
    </View>
  );
}

/* ─── Minimal Card ─── */

function MinimalCard({
  height,
  aspect,
  isTelugu,
  body,
  kicker,
  verseSize,
  verseLineHeight,
  reference,
  fromName,
  fromLabel,
  lang,
}: {
  height: number;
  aspect: ShareAspect;
  isTelugu: boolean;
  body: string;
  kicker: string;
  verseSize: number;
  verseLineHeight: number;
  reference: Localized;
  fromName?: string;
  fromLabel?: string;
  lang: Lang;
}) {
  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff', paddingHorizontal: 64, paddingVertical: aspect === 'status' ? 120 : 72, alignItems: 'center', justifyContent: 'center' }}>
      <MinimalBorder color={colors.primary} />
      <View style={{ alignItems: 'center', gap: 24 }}>
        <Text
          style={{
            fontFamily: fonts.serifSemiBold,
            fontSize: 10,
            lineHeight: 14,
            letterSpacing: 4,
            textTransform: 'uppercase',
            color: colors.onSurfaceVariant,
            textAlign: 'center',
            opacity: 0.5,
          }}
        >
          {kicker}
        </Text>
        <Text
          style={{
            fontFamily: isTelugu ? fonts.teluguRegular : fonts.serifRegular,
            fontSize: verseSize,
            lineHeight: verseLineHeight,
            color: colors.primary,
            textAlign: 'center',
            opacity: 0.85,
          }}
        >
          {isTelugu ? body : `"${body}"`}
        </Text>
        <Text
          style={{
            fontFamily: fonts.labelMedium,
            fontSize: 11,
            lineHeight: 16,
            letterSpacing: 1.6,
            color: colors.onSurfaceVariant,
            textAlign: 'center',
            opacity: 0.5,
          }}
        >
          {reference[lang]}
        </Text>
        {fromName?.trim() ? (
          <Text
            style={{
              fontFamily: isTelugu ? fonts.teluguRegular : fonts.bodyItalic,
              fontSize: 13,
              lineHeight: isTelugu ? 24 : 20,
              color: colors.clay,
              textAlign: 'center',
              opacity: 0.7,
            }}
          >
            {fromLabel} — {fromName.trim()}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

/* ─── Rich Card ─── */

function RichCard({
  height,
  aspect,
  isTelugu,
  body,
  kicker,
  verseSize,
  verseLineHeight,
  reference,
  fromName,
  fromLabel,
  lang,
}: {
  height: number;
  aspect: ShareAspect;
  isTelugu: boolean;
  body: string;
  kicker: string;
  verseSize: number;
  verseLineHeight: number;
  reference: Localized;
  fromName?: string;
  fromLabel?: string;
  lang: Lang;
}) {
  const goldColor = colors.gold;
  return (
    <View style={{ flex: 1, backgroundColor: '#031632', paddingHorizontal: 56, paddingVertical: aspect === 'status' ? 96 : 56, alignItems: 'center', justifyContent: 'center' }}>
      <RichBorder color={goldColor} />
      <CornerFlourishes color={goldColor} />
      <View style={{ alignItems: 'center', gap: 28 }}>
        <CrossIcon size={28} color={goldColor} />
        <Text
          style={{
            fontFamily: fonts.serifSemiBold,
            fontSize: 11,
            lineHeight: 16,
            letterSpacing: 4,
            textTransform: 'uppercase',
            color: goldColor,
            textAlign: 'center',
            opacity: 0.7,
          }}
        >
          {kicker}
        </Text>
        <Text
          style={{
            fontFamily: isTelugu ? fonts.teluguRegular : fonts.serifItalic,
            fontSize: verseSize,
            lineHeight: verseLineHeight,
            color: '#f2f1ed',
            textAlign: 'center',
          }}
        >
          {isTelugu ? body : `"${body}"`}
        </Text>
        <Text
          style={{
            fontFamily: fonts.labelSemiBold,
            fontSize: 12,
            lineHeight: 17,
            letterSpacing: 2,
            color: goldColor,
            textAlign: 'center',
            opacity: 0.6,
          }}
        >
          {reference[lang]}
        </Text>
        {fromName?.trim() ? (
          <Text
            style={{
              fontFamily: isTelugu ? fonts.teluguRegular : fonts.bodyItalic,
              fontSize: 15,
              lineHeight: isTelugu ? 26 : 22,
              color: colors.clay,
              textAlign: 'center',
              opacity: 0.7,
            }}
          >
            {fromLabel} — {fromName.trim()}
          </Text>
        ) : null}
      </View>
      <View style={{ position: 'absolute', bottom: 26, alignSelf: 'center', opacity: 0.3 }}>
        <Text
          style={{
            fontFamily: fonts.labelSemiBold,
            fontSize: 10,
            letterSpacing: 2,
            color: goldColor,
          }}
        >
          DAILY BREAD · దినసరి ఆహారం
        </Text>
      </View>
    </View>
  );
}

/* ─── Main ─── */

export const ShareCanvas = forwardRef<View, ShareCanvasProps>(function ShareCanvas(
  { template, aspect, lang, style, kicker, text, reference, greeting, fromName, fromLabel, scene },
  ref,
) {
  const height = CANVAS_HEIGHT[aspect];
  const isTelugu = lang === 'te';
  const body = text[lang];
  const isOccasion = template === 'morning' || template === 'festival';
  const long = body.length > 140;
  const baseSize = isTelugu ? 30 : 34;
  const verseSize =
    baseSize * (long ? 0.72 : 1) * (aspect === 'post' ? 0.86 : 1) * (isOccasion ? 0.8 : 1) *
    (style === 'rich' ? 0.92 : 1);
  const verseLineHeight = verseSize * (isTelugu ? 1.7 : 1.45);

  const cardProps = {
    height,
    aspect,
    isTelugu,
    body,
    scene,
    template,
    isOccasion,
    greeting,
    kicker,
    verseSize,
    verseLineHeight,
    reference,
    fromName,
    fromLabel,
    lang,
  };

  const inner = (() => {
    switch (style) {
      case 'quote':
        return <QuoteCard {...cardProps} />;
      case 'nature':
        return <NatureCard {...cardProps} />;
      case 'minimal':
        return <MinimalCard {...cardProps} />;
      case 'rich':
        return <RichCard {...cardProps} />;
      default:
        return <ClassicCard {...cardProps} />;
    }
  })();

  return (
    <View
      ref={ref}
      collapsable={false}
      style={{
        width: CANVAS_WIDTH,
        height,
        backgroundColor: colors.surface,
      }}
    >
      {inner}
      {style !== 'rich' ? (
        <View style={{ position: 'absolute', bottom: 26, alignSelf: 'center', opacity: 0.45 }}>
          <Text
            style={{
              fontFamily: fonts.labelSemiBold,
              fontSize: 10,
              letterSpacing: 2,
              color: colors.navyMuted,
            }}
          >
            DAILY BREAD · దినసరి ఆహారం
          </Text>
        </View>
      ) : null}
    </View>
  );
});
