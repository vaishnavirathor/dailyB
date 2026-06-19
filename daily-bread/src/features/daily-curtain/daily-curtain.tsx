import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CrossIcon } from '@/components/icons';
import { ThemedText } from '@/components/themed-text';
import { getContentRepository } from '@/content/bundled';
import { curtainShownDate, setCurtainShownDate } from '@/data/kv';
import { dayOfWeek, fromDateKey } from '@/domain/dates';
import { shouldShowCurtain } from '@/features/daily-curtain/gating';
import { months, t, weekdays } from '@/i18n';
import { useProgress } from '@/stores/progress';
import { useLanguage, useSettings } from '@/stores/settings';
import { colors, fonts, radius, spacing } from '@/theme';

/**
 * The Daily Promise Curtain — a full-screen sanctuary moment shown once
 * per day on the first fresh open. Dismissed by pulling the cloth away
 * IN ANY DIRECTION:
 *
 *  - the sheet follows the finger in 2D (direct manipulation)
 *  - it shears and rotates subtly toward the pull, like held fabric
 *  - the TRAILING corners bow behind the motion (velocity-fed border
 *    radii) — the liquid-cloth signature
 *  - past the threshold (or a flick) it flies off along the user's own
 *    pull vector with their momentum, springing softly; otherwise it
 *    settles back like dropped cloth
 *  - the promise text lags inside the sheet (inertia) and fades early
 */
export function DailyCurtain() {
  const lang = useLanguage();
  const onboarded = useSettings((s) => s.onboarded);
  const curtainEnabled = useSettings((s) => s.curtainEnabled);
  const todayKey = useProgress((s) => s.todayKey);
  const [visible, setVisible] = useState(false);
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();

  const diagonal = Math.hypot(screenWidth, screenHeight);
  const threshold = Math.min(screenWidth, screenHeight) * 0.28;

  // Cloth offset — gesture-driven, then sprung to the exit point.
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  // Springy bow components fed by drag velocity (the "liquid").
  const bowX = useSharedValue(0);
  const bowY = useSharedValue(0);
  const fade = useSharedValue(1); // reduced-motion path
  const hintPulse = useSharedValue(0);

  useEffect(() => {
    if (!onboarded || !curtainEnabled) {
      return;
    }
    let active = true;
    void curtainShownDate().then((lastShown) => {
      if (active && shouldShowCurtain(lastShown, todayKey)) {
        tx.set(0);
        ty.set(0);
        bowX.set(0);
        bowY.set(0);
        fade.set(1);
        setVisible(true);
      }
    });
    return () => {
      active = false;
    };
  }, [onboarded, curtainEnabled, todayKey, tx, ty, bowX, bowY, fade]);

  useEffect(() => {
    if (visible) {
      hintPulse.set(
        withDelay(
          900,
          withRepeat(
            withSequence(withTiming(1, { duration: 900 }), withTiming(0, { duration: 900 })),
            -1,
          ),
        ),
      );
    }
  }, [visible, hintPulse]);

  const finish = useCallback(() => {
    setVisible(false);
    void setCurtainShownDate(todayKey);
  }, [todayKey]);

  /** Fly the cloth off along (dirX, dirY), carrying the user's momentum. */
  const dismissAlong = useCallback(
    (fromX: number, fromY: number, velocityX: number, velocityY: number) => {
      if (reducedMotion) {
        fade.set(
          withTiming(0, { duration: 380 }, (done) => {
            if (done) {
              scheduleOnRN(finish);
            }
          }),
        );
        return;
      }
      // Direction = drag vector; a pure flick falls back to velocity;
      // a button tap (all zeros) lifts upward like a stage curtain.
      let dirX = fromX;
      let dirY = fromY;
      if (Math.hypot(dirX, dirY) < 24) {
        dirX = velocityX;
        dirY = velocityY;
      }
      if (Math.hypot(dirX, dirY) < 24) {
        dirX = 0;
        dirY = -1;
      }
      const magnitude = Math.hypot(dirX, dirY);
      const exitX = (dirX / magnitude) * diagonal * 1.15;
      const exitY = (dirY / magnitude) * diagonal * 1.15;

      bowX.set(withSpring(0, { damping: 9, stiffness: 110 }));
      bowY.set(withSpring(0, { damping: 9, stiffness: 110 }));
      tx.set(withSpring(exitX, { damping: 16, stiffness: 56, mass: 0.9, velocity: velocityX }));
      ty.set(
        withSpring(
          exitY,
          { damping: 16, stiffness: 56, mass: 0.9, velocity: velocityY },
          (done) => {
            if (done) {
              scheduleOnRN(finish);
            }
          },
        ),
      );
    },
    [bowX, bowY, diagonal, fade, finish, reducedMotion, tx, ty],
  );

  const settleBack = useCallback(() => {
    bowX.set(withSpring(0, { damping: 10, stiffness: 110 }));
    bowY.set(withSpring(0, { damping: 10, stiffness: 110 }));
    tx.set(withSpring(0, { damping: 14, stiffness: 120 }));
    ty.set(withSpring(0, { damping: 14, stiffness: 120 }));
  }, [bowX, bowY, tx, ty]);

  const pan = Gesture.Pan()
    .enabled(visible)
    .onUpdate((event) => {
      'worklet';
      tx.set(event.translationX);
      ty.set(event.translationY);
      bowX.set(Math.max(-110, Math.min(110, event.velocityX * 0.04)));
      bowY.set(Math.max(-110, Math.min(110, event.velocityY * 0.04)));
    })
    .onEnd((event) => {
      'worklet';
      const distance = Math.hypot(tx.get(), ty.get());
      const speed = Math.hypot(event.velocityX, event.velocityY);
      if (distance > threshold || speed > 900) {
        scheduleOnRN(dismissAlong, tx.get(), ty.get(), event.velocityX, event.velocityY);
      } else {
        scheduleOnRN(settleBack);
      }
    });

  /** 0 → at rest, 1 → past threshold (drives fades/parallax). */
  const pull = useDerivedValue(() => Math.min(1, Math.hypot(tx.get(), ty.get()) / (threshold * 2)));

  // The cloth: 2D follow + fabric shear/rotation + trailing-corner bows.
  const curtainStyle = useAnimatedStyle(() => {
    const x = tx.get();
    const y = ty.get();
    // Motion components, velocity-boosted so fast pulls bow deeper.
    const up = Math.max(0, -(y + bowY.get() * 2));
    const down = Math.max(0, y + bowY.get() * 2);
    const left = Math.max(0, -(x + bowX.get() * 2));
    const right = Math.max(0, x + bowX.get() * 2);
    const bow = (a: number, b: number) => Math.min(170, (a + b) * 0.24);

    return {
      transform: [
        { translateX: x },
        { translateY: y },
        // Held fabric twists toward the pull…
        { rotate: `${Math.max(-9, Math.min(9, x * 0.018 + (x * y) / 60000))}deg` },
        // …and shears along it.
        { skewX: `${Math.max(-6, Math.min(6, x * 0.008))}deg` },
        { skewY: `${Math.max(-4, Math.min(4, (x * -0.003 * Math.sign(y || 1))))}deg` },
        { scale: 1 + pull.get() * 0.03 },
      ],
      // Trailing corners (opposite the motion) bow like lifted cloth.
      borderBottomLeftRadius: bow(up, right),
      borderBottomRightRadius: bow(up, left),
      borderTopLeftRadius: bow(down, right),
      borderTopRightRadius: bow(down, left),
      opacity: fade.get(),
    };
  });

  // Promise text lags inside the sheet (inertia) and fades early.
  const contentStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pull.get(), [0, 0.7], [1, 0], Extrapolation.CLAMP) * fade.get(),
    transform: [
      { translateX: -tx.get() * 0.16 },
      { translateY: -ty.get() * 0.16 },
      { scale: 1 - pull.get() * 0.05 },
    ],
  }));

  // Soft shadow ring grows as the cloth lifts off the page.
  const liftShadowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pull.get(), [0, 0.2, 1], [0, 0.32, 0.12], Extrapolation.CLAMP),
  }));

  const hintStyle = useAnimatedStyle(() => ({
    opacity: Math.max(0, 1 - pull.get() * 2.4) * (0.45 + hintPulse.get() * 0.55),
    transform: [{ translateY: -hintPulse.get() * 8 }],
  }));

  const greetingHour = new Date().getHours();
  const promise = getContentRepository().promiseFor(todayKey);
  const date = fromDateKey(todayKey);
  const dateLine =
    lang === 'te'
      ? `${weekdays[lang][dayOfWeek(todayKey)]}, ${date.getDate()} ${months[lang][date.getMonth()]}`
      : `${weekdays[lang][dayOfWeek(todayKey)]}, ${months[lang][date.getMonth()]} ${date.getDate()}`;

  // Toggled off mid-session (or never enabled) → never render.
  if (!visible || !curtainEnabled || !onboarded) {
    return null;
  }

  const promiseText = promise.text[lang];
  const long = promiseText.length > 130;
  const promiseSize = (lang === 'te' ? 26 : 28) * (long ? 0.78 : 1);
  const promiseLineHeight = promiseSize * (lang === 'te' ? 1.75 : 1.5);

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 }}>
      <StatusBar style="light" />
      {/* Lift shadow sits UNDER the cloth, around its current position. */}
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',
            top: '6%',
            left: '6%',
            right: '6%',
            bottom: '6%',
            borderRadius: 48,
            backgroundColor: '#000',
          },
          liftShadowStyle,
        ]}
      />
      <GestureDetector gesture={pan}>
        <Animated.View style={[{ flex: 1, overflow: 'hidden' }, curtainStyle]}>
          {/* Sanctuary night → dawn backdrop */}
          <LinearGradient
            colors={[colors.primary, '#0d2240', colors.primaryContainer]}
            locations={[0, 0.55, 1]}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          />

          {/* Cloth fold shading — wide soft vertical bands */}
          {[0.08, 0.3, 0.52, 0.74, 0.92].map((position, index) => (
            <LinearGradient
              key={index}
              colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.16)', 'rgba(0,0,0,0)']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: `${position * 100 - 7}%`,
                width: '14%',
                opacity: index % 2 === 0 ? 0.7 : 0.45,
              }}
            />
          ))}
          {/* Top sheen — light catching the fabric */}
          <LinearGradient
            colors={['rgba(255,255,255,0.10)', 'rgba(255,255,255,0)']}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 140 }}
          />

          {/* Gold dawn glow behind the promise */}
          <View
            style={{
              position: 'absolute',
              alignSelf: 'center',
              top: '28%',
              width: 320,
              height: 320,
              borderRadius: radius.full,
              backgroundColor: 'rgba(233,195,73,0.10)',
            }}
          />
          <View
            style={{
              position: 'absolute',
              alignSelf: 'center',
              top: '34%',
              width: 200,
              height: 200,
              borderRadius: radius.full,
              backgroundColor: 'rgba(254,214,91,0.08)',
            }}
          />

          <Animated.View
            style={[
              {
                flex: 1,
                paddingTop: insets.top + spacing.stackLg,
                paddingBottom: insets.bottom + spacing.stackLg,
                paddingHorizontal: spacing.containerMargin + 8,
                alignItems: 'center',
                justifyContent: 'center',
                gap: spacing.stackMd,
              },
              contentStyle,
            ]}
          >
            <ThemedText
              variant="labelMd"
              style={{ color: colors.inversePrimary, letterSpacing: 2.4, textTransform: 'uppercase' }}
            >
              {dateLine}
            </ThemedText>
            {greetingHour < 12 ? (
              <ThemedText
                lang={lang}
                style={{
                  fontFamily: lang === 'te' ? fonts.teluguSemiBold : fonts.serifItalic,
                  fontSize: 22,
                  lineHeight: lang === 'te' ? 38 : 30,
                  color: colors.secondaryFixedDim,
                }}
              >
                {t('goodMorning', lang)}
              </ThemedText>
            ) : null}

            <CrossIcon size={34} color={colors.goldBright} />

            <ThemedText
              variant="labelSm"
              style={{
                color: 'rgba(254,214,91,0.85)',
                letterSpacing: 3.2,
                textTransform: 'uppercase',
              }}
            >
              {t('dailyPromise', lang)}
            </ThemedText>

            <ThemedText
              selectable={false}
              align="center"
              style={{
                fontFamily: lang === 'te' ? fonts.teluguRegular : fonts.serifItalic,
                fontSize: promiseSize,
                lineHeight: promiseLineHeight,
                color: '#f2f1ed',
              }}
            >
              {lang === 'te' ? promiseText : `“${promiseText}”`}
            </ThemedText>

            <ThemedText
              variant="labelMd"
              style={{ color: colors.inversePrimary, letterSpacing: 2.1, textTransform: 'uppercase' }}
            >
              {promise.reference[lang]}
            </ThemedText>
          </Animated.View>

          {/* Hint + tap fallback pinned near the hem */}
          <Animated.View
            style={[
              {
                position: 'absolute',
                bottom: insets.bottom + spacing.stackMd,
                left: 0,
                right: 0,
                alignItems: 'center',
                gap: spacing.stackSm,
              },
              hintStyle,
            ]}
          >
            <ThemedText style={{ fontSize: 18, lineHeight: 24, color: colors.goldBright }}>✥</ThemedText>
            <ThemedText variant="labelMd" style={{ color: colors.inversePrimary, letterSpacing: 1.4 }}>
              {t('curtainSwipeHint', lang)}
            </ThemedText>
            <Pressable
              accessibilityRole="button"
              onPress={() => dismissAlong(0, 0, 0, 0)}
              style={({ pressed }) => ({
                marginTop: 2,
                paddingVertical: 10,
                paddingHorizontal: 22,
                borderRadius: radius.full,
                borderWidth: 1,
                borderColor: 'rgba(233,195,73,0.45)',
                backgroundColor: pressed ? 'rgba(233,195,73,0.16)' : 'rgba(233,195,73,0.08)',
              })}
            >
              <ThemedText variant="labelMd" style={{ color: colors.goldBright, letterSpacing: 1.2 }}>
                {t('beginDay', lang)}
              </ThemedText>
            </Pressable>
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
