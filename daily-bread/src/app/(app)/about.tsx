import { useRef } from 'react';
import { Pressable, View } from 'react-native';

import { Card } from '@/components/card';
import { CrossIcon } from '@/components/icons';
import { Screen } from '@/components/screen';
import { ScreenHeader } from '@/components/screen-header';
import { ThemedText } from '@/components/themed-text';
import type { Localized } from '@/content/types';
import { setCurtainShownDate } from '@/data/kv';
import { useLanguage } from '@/stores/settings';
import { colors, fonts, radius, spacing } from '@/theme';

interface Phase {
  tag: Localized;
  timeframe: Localized;
  title: Localized;
  description: Localized;
  pills: Localized[];
}

/** Roadmap copy — the product promise, shown plainly to users. */
const phases: Phase[] = [
  {
    tag: { en: 'Phase 1', te: 'దశ 1' },
    timeframe: { en: 'Now', te: 'ఇప్పుడు' },
    title: { en: 'One region, one tradition — done well', te: 'ఒక ప్రాంతం, ఒక సంప్రదాయం — చక్కగా' },
    description: {
      en: 'Telugu first: the daily loop, the sharing engine, the denomination-aware calendar, lyrics and the first storefront shelf.',
      te: 'తెలుగు మొదట: దైనందిన ఆరాధన, పంచుకునే సదుపాయం, సంప్రదాయానుసార క్యాలెండర్, గీతాలు, తొలి దుకాణం.',
    },
    pills: [
      { en: 'Daily loop', te: 'దైనందిన ఆరాధన' },
      { en: 'Sharing', te: 'పంచుకోవడం' },
      { en: '3 calendar layers', te: '3 క్యాలెండర్ పొరలు' },
      { en: 'Store pilot', te: 'దుకాణం పైలట్' },
    ],
  },
  {
    tag: { en: 'Phase 2', te: 'దశ 2' },
    timeframe: { en: 'Next', te: 'తరువాత' },
    title: { en: 'More languages, real community', te: 'మరిన్ని భాషలు, నిజమైన సహవాసం' },
    description: {
      en: 'Malayalam, Tamil, Hindi and English. Prayer requests wall, family & church groups, fresh server-fed content and the full storefront.',
      te: 'మలయాళం, తమిళం, హిందీ, ఇంగ్లీష్. ప్రార్థన విన్నపాల గోడ, కుటుంబ-సంఘ బృందాలు, సర్వర్ ఆధారిత కొత్త కంటెంట్, పూర్తి దుకాణం.',
    },
    pills: [
      { en: '5 languages', te: '5 భాషలు' },
      { en: 'Prayer wall', te: 'ప్రార్థన గోడ' },
      { en: 'Groups', te: 'బృందాలు' },
      { en: 'UPI checkout', te: 'UPI చెల్లింపు' },
    ],
  },
  {
    tag: { en: 'Phase 3', te: 'దశ 3' },
    timeframe: { en: 'Later', te: 'ఆ తరువాత' },
    title: { en: 'Serving the diaspora', te: 'ప్రవాస భారతీయుల సేవలో' },
    description: {
      en: 'Blessed-item delivery to NRI families, novena and prayer services, festival commerce, audio Bible with real voices.',
      te: 'NRI కుటుంబాలకు ఆశీర్వాద వస్తువుల డెలివరీ, నొవేనా-ప్రార్థన సేవలు, పండుగ కానుకలు, నిజమైన స్వరాలతో ఆడియో బైబిల్.',
    },
    pills: [
      { en: 'NRI delivery', te: 'NRI డెలివరీ' },
      { en: 'Novena services', te: 'నొవేనా సేవలు' },
      { en: 'Audio Bible', te: 'ఆడియో బైబిల్' },
    ],
  },
];

export default function AboutScreen() {
  const lang = useLanguage();
  const taps = useRef(0);

  // Hidden dev affordance: 5 quick taps on the version line clears the
  // curtain date so the once-a-day Promise Curtain shows on next launch.
  const rearmCurtain = () => {
    taps.current += 1;
    if (taps.current >= 5) {
      taps.current = 0;
      void setCurtainShownDate('');
    }
  };

  return (
    <>
      <Screen gap={spacing.stackMd}>
        <ScreenHeader
          menu
          eyebrow="Daily Bread · దినసరి ఆహారం"
          title={lang === 'te' ? 'మా ప్రయాణం' : 'Our journey'}
        />

        {/* Roadmap: vertical phased rows, hairline rules, no shadows. */}
        <Card padding={0} style={{ paddingHorizontal: spacing.stackMd }}>
          {phases.map((phase, index) => (
            <View
              key={index}
              style={{
                paddingVertical: spacing.stackMd,
                borderTopWidth: index === 0 ? 0 : 1,
                borderTopColor: colors.surfaceContainerHigh,
                gap: spacing.stackSm,
              }}
            >
              <View>
                <ThemedText
                  style={{
                    fontFamily: lang === 'te' ? fonts.teluguRegular : fonts.serifItalic,
                    fontSize: 17,
                    lineHeight: lang === 'te' ? 30 : 24,
                    color: colors.clay,
                  }}
                >
                  {phase.tag[lang]}
                </ThemedText>
                <ThemedText
                  variant="labelSm"
                  color="onSurfaceVariant"
                  style={{ textTransform: 'uppercase', letterSpacing: 1.8, marginTop: 2 }}
                >
                  {phase.timeframe[lang]}
                </ThemedText>
              </View>
              <ThemedText variant="headlineSm" color="primary">
                {phase.title[lang]}
              </ThemedText>
              <ThemedText variant="bodyMd" color="onSurfaceVariant">
                {phase.description[lang]}
              </ThemedText>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
                {phase.pills.map((pill, i) => (
                  <View
                    key={i}
                    style={{
                      backgroundColor: colors.surfaceContainer,
                      borderWidth: 1,
                      borderColor: colors.outlineVariant,
                      borderRadius: radius.full,
                      paddingVertical: 5,
                      paddingHorizontal: 13,
                    }}
                  >
                    <ThemedText variant="labelMd" color="onSurfaceVariant" style={{ fontSize: 11.5 }}>
                      {pill[lang]}
                    </ThemedText>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </Card>

        <View style={{ alignItems: 'center', gap: spacing.stackSm, paddingVertical: spacing.stackMd }}>
          <CrossIcon size={30} color={colors.gold} />
          <ThemedText variant="bodySm" color="onSurfaceVariant" align="center">
            {lang === 'te'
              ? 'అలవాటు మరియు పంచుకోవడం కోసం ముందుగా నిర్మించాం — వాణిజ్యం ఎప్పుడూ వాక్యం కంటే పైకి అరవదు.'
              : 'Built for habit and sharing first — commerce never shouts over scripture.'}
          </ThemedText>
          {/* Dev affordance: 5 taps re-arms the once-a-day Promise Curtain. */}
          <Pressable accessibilityRole="button" onPress={rearmCurtain} hitSlop={8}>
            <ThemedText variant="labelMd" color="onSurfaceVariant">
              Daily Bread · దినసరి ఆహారం · v1.0.0
            </ThemedText>
          </Pressable>
        </View>
      </Screen>
    </>
  );
}
