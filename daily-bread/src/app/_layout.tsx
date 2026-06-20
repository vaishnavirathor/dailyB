import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import {
  NotoSerif_400Regular,
  NotoSerif_400Regular_Italic,
  NotoSerif_600SemiBold,
  NotoSerif_700Bold,
} from '@expo-google-fonts/noto-serif';
import {
  SourceSerif4_400Regular,
  SourceSerif4_400Regular_Italic,
  SourceSerif4_600SemiBold,
} from '@expo-google-fonts/source-serif-4';
import { NTR_400Regular } from '@expo-google-fonts/ntr';
import { Suranna_400Regular } from '@expo-google-fonts/suranna';
import { Timmana_400Regular } from '@expo-google-fonts/timmana';
import { Gurajada_400Regular } from '@expo-google-fonts/gurajada';
import {
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_400Regular,
} from '@expo-google-fonts/playfair-display';
import {
  CormorantGaramond_600SemiBold,
  CormorantGaramond_400Regular,
} from '@expo-google-fonts/cormorant-garamond';
import {
  Lora_600SemiBold,
  Lora_400Regular,
} from '@expo-google-fonts/lora';
import {
  Merriweather_700Bold,
  Merriweather_400Regular,
} from '@expo-google-fonts/merriweather';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { getDb } from '@/data/db';
import { configureNotificationHandling, syncNotifications } from '@/services/notifications';
import { startTracker } from '@/services/app-tracking';
import { initSettingsPersistence } from '@/stores/persistence';
import { useAuth } from '@/stores/auth';
import { useProgress } from '@/stores/progress';
import { useSettings } from '@/stores/settings';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    NotoSerif_400Regular,
    NotoSerif_400Regular_Italic,
    NotoSerif_600SemiBold,
    NotoSerif_700Bold,
    NTR_400Regular,
    Suranna_400Regular,
    Timmana_400Regular,
    Gurajada_400Regular,
    SourceSerif4_400Regular,
    SourceSerif4_400Regular_Italic,
    SourceSerif4_600SemiBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_400Regular,
    CormorantGaramond_600SemiBold,
    CormorantGaramond_400Regular,
    Lora_600SemiBold,
    Lora_400Regular,
    Merriweather_700Bold,
    Merriweather_400Regular,
  });
  const [initialized, setInitialized] = useState(false);
  const onboarded = useSettings((s) => s.onboarded);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await getDb(); // run migrations before anything reads
        await useAuth.getState().hydrate();
        await initSettingsPersistence();
        startTracker();
        configureNotificationHandling();
        await useProgress.getState().refresh();
        // Re-reconcile on every launch so feast reminders roll forward.
        const s = useSettings.getState();
        void syncNotifications({
          enabled: s.notificationsEnabled,
          time: s.reminderTime,
          lang: s.language,
          tradition: s.tradition,
        });
      } catch (error) {
        console.warn('[init] startup failed', error);
      }
      if (!cancelled) {
        setInitialized(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Roll the day over (streak, today's content) when the app returns to
  // the foreground — devotional apps live across midnights.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        useProgress.getState().refresh();
      }
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (fontsLoaded && initialized) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, initialized]);

  if (!fontsLoaded || !initialized) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.surface },
        }}
      >
        <Stack.Protected guard={onboarded}>
          <Stack.Screen name="(app)" />
          <Stack.Screen
            name="prayer"
            options={{
              presentation: 'formSheet',
              sheetGrabberVisible: true,
              sheetAllowedDetents: [0.75, 1.0],
            }}
          />
          <Stack.Screen name="reader" options={{ presentation: 'modal' }} />
          <Stack.Screen name="milestone" options={{ presentation: 'modal' }} />
          <Stack.Screen name="ritual" options={{ presentation: 'fullScreenModal' }} />
        </Stack.Protected>
        <Stack.Protected guard={!onboarded}>
          <Stack.Screen name="(onboarding)" />
        </Stack.Protected>
      </Stack>
    </GestureHandlerRootView>
  );
}
