import {
  getHdAudioFile,
  hdVoiceConfigured,
  playHdFile,
  stopHdPlayback,
} from '@/services/hd-voice';
import { speak, stopSpeaking, type SpeakHandlers } from '@/services/tts';
import type { Lang } from '@/theme';

/**
 * The one read-aloud entry point: HD neural voice when enabled and
 * reachable, device TTS otherwise — callers never know the difference.
 */

export async function smartSpeak(
  text: string,
  lang: Lang,
  handlers: SpeakHandlers = {},
): Promise<void> {
  if (hdVoiceConfigured()) {
    const file = await getHdAudioFile(text, lang);
    if (file) {
      await stopSpeaking();
      await playHdFile(file, () => handlers.onDone?.());
      return;
    }
  }
  await speak(text, lang, handlers);
}

/**
 * Sequence reading (chapters, hymns, ritual slides) with follow-along
 * callbacks. HD mode prefetches the next item while the current one
 * plays, so the voice never pauses between verses.
 */
export function smartSequence(
  items: string[],
  lang: Lang,
  callbacks: { onIndex?: (index: number) => void; onDone?: () => void } = {},
): () => void {
  let cancelled = false;

  const stepDevice = (index: number) => {
    if (cancelled || index >= items.length) {
      if (!cancelled) {
        callbacks.onDone?.();
      }
      return;
    }
    callbacks.onIndex?.(index);
    void speak(items[index], lang, {
      onDone: () => stepDevice(index + 1),
      onError: () => stepDevice(index + 1),
    });
  };

  const stepHd = async (index: number) => {
    if (cancelled || index >= items.length) {
      if (!cancelled) {
        callbacks.onDone?.();
      }
      return;
    }
    const file = await getHdAudioFile(items[index], lang);
    if (cancelled) {
      return;
    }
    if (!file) {
      stepDevice(index); // degrade mid-sequence rather than stopping
      return;
    }
    callbacks.onIndex?.(index);
    // Warm the next verse while this one plays.
    if (index + 1 < items.length) {
      void getHdAudioFile(items[index + 1], lang);
    }
    await playHdFile(file, () => {
      void stepHd(index + 1);
    });
  };

  if (hdVoiceConfigured()) {
    void stepHd(0);
  } else {
    stepDevice(0);
  }

  return () => {
    cancelled = true;
    stopHdPlayback();
    void stopSpeaking();
  };
}

export function stopAllVoice(): void {
  stopHdPlayback();
  void stopSpeaking();
}
