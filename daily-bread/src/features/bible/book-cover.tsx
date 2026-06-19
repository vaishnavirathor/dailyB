import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, View } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { CrossIcon } from '@/components/icons';
import { ThemedText } from '@/components/themed-text';
import type { BibleVersionInfo } from '@/bible/books';
import { colors, fonts, type Lang } from '@/theme';

const LEATHER = {
  navy: {
    face: ['#16315a', '#0b2244', '#061830'] as const,
    spine: '#04101f',
    band: 'rgba(233,195,73,0.35)',
    sheen: 'rgba(255,255,255,0.10)',
  },
  burgundy: {
    face: ['#6d3530', '#54251f', '#3a1713'] as const,
    spine: '#2a0f0c',
    band: 'rgba(233,195,73,0.40)',
    sheen: 'rgba(255,255,255,0.08)',
  },
};

/**
 * A realistic closed Bible: leather gradient face with a sheen, raised
 * spine bands, embossed gold frame + cross + title, gilded page block on
 * the fore-edge, and a ribbon marker peeking from the foot. Pressing it
 * gives a soft push-in spring — like taking the book off the shelf.
 */
export function BookCover({
  info,
  lang,
  index,
  onPress,
}: {
  info: BibleVersionInfo;
  lang: Lang;
  index: number;
  onPress: () => void;
}) {
  const palette = LEATHER[info.cover];
  const press = useSharedValue(0);

  const pressStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: 1 - press.get() * 0.05 },
      { rotateZ: `${press.get() * -1.2}deg` },
      { translateY: press.get() * 3 },
    ],
  }));

  const isTeluguTitle = info.id === 'te-ov';

  return (
    <Animated.View
      entering={FadeInDown.delay(150 + index * 160).springify().damping(14)}
      style={[{ width: '100%' }, pressStyle]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={info.subtitle[lang]}
        onPressIn={() => press.set(withSpring(1, { damping: 18, stiffness: 240 }))}
        onPressOut={() => press.set(withSpring(0, { damping: 14, stiffness: 180 }))}
        onPress={onPress}
      >
        <View
          style={{
            aspectRatio: 0.7,
            flexDirection: 'row',
            borderRadius: 6,
            borderTopRightRadius: 12,
            borderBottomRightRadius: 12,
            overflow: 'hidden',
            boxShadow: '0 10px 22px rgba(3,22,50,0.28), 0 2px 6px rgba(3,22,50,0.18)',
          }}
        >
          {/* Spine — darker leather with two raised bands */}
          <View style={{ width: 14, backgroundColor: palette.spine }}>
            <View style={{ position: 'absolute', top: '16%', left: 2, right: 2, height: 2, backgroundColor: palette.band, borderRadius: 1 }} />
            <View style={{ position: 'absolute', bottom: '16%', left: 2, right: 2, height: 2, backgroundColor: palette.band, borderRadius: 1 }} />
          </View>

          {/* Cover face */}
          <View style={{ flex: 1 }}>
            <LinearGradient
              colors={palette.face}
              locations={[0, 0.5, 1]}
              start={{ x: 0.1, y: 0 }}
              end={{ x: 0.9, y: 1 }}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            />
            {/* Light catching the top of the leather */}
            <LinearGradient
              colors={[palette.sheen, 'rgba(255,255,255,0)']}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '34%' }}
            />

            {/* Embossed frame — a quiet double line */}
            <View
              style={{
                position: 'absolute',
                top: 9,
                left: 9,
                right: 9,
                bottom: 9,
                borderWidth: 1,
                borderColor: 'rgba(233,195,73,0.38)',
                borderRadius: 4,
              }}
            />
            <View
              style={{
                position: 'absolute',
                top: 13,
                left: 13,
                right: 13,
                bottom: 13,
                borderWidth: 0.5,
                borderColor: 'rgba(233,195,73,0.22)',
                borderRadius: 3,
              }}
            />

            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 16 }}>
              <CrossIcon size={34} color={colors.goldBright} strokeWidth={2} />
              <ThemedText
                align="center"
                selectable={false}
                style={{
                  fontFamily: isTeluguTitle ? fonts.teluguBold : fonts.serifBold,
                  fontSize: isTeluguTitle ? 17 : 18,
                  lineHeight: isTeluguTitle ? 30 : 24,
                  letterSpacing: isTeluguTitle ? 0 : 2.4,
                  color: colors.goldBright,
                  textShadowColor: 'rgba(0,0,0,0.55)',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 1,
                }}
              >
                {info.title[lang]}
              </ThemedText>
            </View>

            {/* Ribbon marker peeking from the foot */}
            <View
              style={{
                position: 'absolute',
                bottom: -2,
                right: '26%',
                width: 12,
                height: 22,
                backgroundColor: colors.clay,
                transform: [{ rotate: '3deg' }],
                borderBottomLeftRadius: 2,
                borderBottomRightRadius: 6,
              }}
            />
          </View>

          {/* Fore-edge page block with a slim gilt line */}
          <View style={{ width: 7, backgroundColor: '#f6f1e4' }}>
            <View
              style={{
                position: 'absolute',
                top: 1,
                bottom: 1,
                right: 0,
                width: 1.5,
                backgroundColor: colors.goldBright,
                opacity: 0.65,
              }}
            />
            {[0.25, 0.5, 0.75].map((position) => (
              <View
                key={position}
                style={{
                  position: 'absolute',
                  top: `${position * 100}%`,
                  left: 1,
                  right: 2.5,
                  height: 1,
                  backgroundColor: 'rgba(120,105,80,0.16)',
                }}
              />
            ))}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}
