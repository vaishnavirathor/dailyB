import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import * as Crypto from 'expo-crypto';
import { Directory, File, Paths } from 'expo-file-system';

import { getSupabase, hasSupabaseConfig } from '@/community/supabase-client';
import { useSettings } from '@/stores/settings';
import type { Lang } from '@/theme';

/**
 * HD neural voice ("the pastor voice"): audio is synthesized server-side
 * (Supabase edge function `tts` — Azure / Sarvam / ElevenLabs, key held
 * on the server, shared storage cache) and cached on-device, so each
 * sentence is fetched once and replays offline.
 */

let audioModeReady = false;

async function ensureAudioMode(): Promise<void> {
  if (!audioModeReady) {
    audioModeReady = true;
    try {
      await setAudioModeAsync({ playsInSilentMode: true });
    } catch {
      // non-critical — playback just follows the silent switch
    }
  }
}

function cacheDir(): Directory {
  const dir = new Directory(Paths.cache, 'hd-voice');
  if (!dir.exists) {
    dir.create({ intermediates: true });
  }
  return dir;
}

/**
 * DEV direct mode — TESTING ONLY: lets you hear Azure/Sarvam in the app
 * before the backend exists by calling the provider straight from the
 * device with EXPO_PUBLIC_DEV_* keys from .env. Those keys end up in the
 * JS bundle, so never ship a build with them set — the edge-function
 * path (server-held keys) is the production route and wins when present.
 */
const DEV_AZURE_KEY = process.env.EXPO_PUBLIC_DEV_AZURE_SPEECH_KEY;
const DEV_AZURE_REGION = process.env.EXPO_PUBLIC_DEV_AZURE_SPEECH_REGION ?? 'centralindia';
const DEV_SARVAM_KEY = process.env.EXPO_PUBLIC_DEV_SARVAM_API_KEY;

function devDirectConfigured(): boolean {
  const provider = useSettings.getState().hdProvider;
  if (provider === 'azure') {
    return !!DEV_AZURE_KEY;
  }
  if (provider === 'sarvam') {
    return !!DEV_SARVAM_KEY;
  }
  return false;
}

export function hdVoiceConfigured(): boolean {
  return useSettings.getState().hdVoiceEnabled && (hasSupabaseConfig() || devDirectConfigured());
}

const AZURE_VOICES: Record<Lang, Record<'female' | 'male', string>> = {
  te: { female: 'te-IN-ShrutiNeural', male: 'te-IN-MohanNeural' },
  en: { female: 'en-IN-NeerjaNeural', male: 'en-IN-PrabhatNeural' },
};

const SARVAM_SPEAKERS: Record<'female' | 'male', string> = {
  female: 'anushka',
  male: 'abhilash',
};

function xmlEscape(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

async function devSynthesize(
  text: string,
  lang: Lang,
  gender: 'female' | 'male',
): Promise<Uint8Array | null> {
  const provider = useSettings.getState().hdProvider;
  try {
    if (provider === 'azure' && DEV_AZURE_KEY) {
      const voice = AZURE_VOICES[lang][gender];
      const locale = lang === 'te' ? 'te-IN' : 'en-IN';
      const ssml = `<speak version="1.0" xml:lang="${locale}"><voice name="${voice}"><prosody rate="-6%">${xmlEscape(text)}</prosody></voice></speak>`;
      const response = await fetch(
        `https://${DEV_AZURE_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`,
        {
          method: 'POST',
          headers: {
            'Ocp-Apim-Subscription-Key': DEV_AZURE_KEY,
            'Content-Type': 'application/ssml+xml',
            'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
          },
          body: ssml,
        },
      );
      if (!response.ok) {
        console.warn('[hd-voice] dev azure failed', response.status, await response.text());
        return null;
      }
      return new Uint8Array(await response.arrayBuffer());
    }
    if (provider === 'sarvam' && DEV_SARVAM_KEY) {
      const response = await fetch('https://api.sarvam.ai/text-to-speech', {
        method: 'POST',
        headers: { 'api-subscription-key': DEV_SARVAM_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputs: [text],
          target_language_code: lang === 'te' ? 'te-IN' : 'en-IN',
          speaker: SARVAM_SPEAKERS[gender],
          model: 'bulbul:v2',
          speech_sample_rate: 22050,
        }),
      });
      if (!response.ok) {
        console.warn('[hd-voice] dev sarvam failed', response.status, await response.text());
        return null;
      }
      const json = (await response.json()) as { audios: string[] };
      const base64 = json.audios?.[0];
      if (!base64) {
        return null;
      }
      return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    }
  } catch (error) {
    console.warn('[hd-voice] dev synthesis failed', error);
  }
  return null;
}

/**
 * Local file for this utterance, fetching through the edge function on a
 * cache miss. Null = HD unavailable (offline/unconfigured/server error)
 * — callers fall back to device TTS.
 */
export async function getHdAudioFile(text: string, lang: Lang): Promise<File | null> {
  if (!hdVoiceConfigured()) {
    return null;
  }
  try {
    const settings = useSettings.getState();
    const provider = settings.hdProvider;
    const gender = settings.ttsGender === 'male' ? 'male' : 'female';
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      `${provider}:${gender}:${lang}:${text}`,
    );
    const ext = provider === 'sarvam' ? 'wav' : 'mp3';
    const file = new File(cacheDir(), `${hash.slice(0, 40)}.${ext}`);
    if (file.exists && (file.size ?? 0) > 0) {
      return file;
    }

    // Production path: edge function with server-held keys.
    if (hasSupabaseConfig()) {
      const { data, error } = await getSupabase().functions.invoke<{ url: string }>('tts', {
        body: { text, lang, provider, gender },
      });
      if (error || !data?.url) {
        console.warn('[hd-voice] synthesis failed', error);
        return null;
      }
      const response = await fetch(data.url);
      if (!response.ok) {
        return null;
      }
      file.write(new Uint8Array(await response.arrayBuffer()));
      return file;
    }

    // Dev direct mode (testing only — see note above).
    const bytes = await devSynthesize(text, lang, gender);
    if (!bytes) {
      return null;
    }
    file.write(bytes);
    return file;
  } catch (error) {
    console.warn('[hd-voice] fetch failed', error);
    return null;
  }
}

let currentPlayer: AudioPlayer | null = null;

export function stopHdPlayback(): void {
  if (currentPlayer) {
    try {
      currentPlayer.remove();
    } catch {
      // already released
    }
    currentPlayer = null;
  }
}

/** Plays one cached file; resolves true on natural finish. */
export async function playHdFile(file: File, onDone: () => void): Promise<void> {
  await ensureAudioMode();
  stopHdPlayback();
  const player = createAudioPlayer(file.uri);
  currentPlayer = player;
  player.addListener('playbackStatusUpdate', (status) => {
    if (status.didJustFinish && currentPlayer === player) {
      stopHdPlayback();
      onDone();
    }
  });
  player.play();
}
