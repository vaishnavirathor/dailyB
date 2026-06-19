import * as Sharing from 'expo-sharing';
import type { RefObject } from 'react';
import type { View } from 'react-native';
import { captureRef } from 'react-native-view-shot';

/**
 * Renders a mounted (off-viewport) view to a PNG and opens the OS share
 * sheet — the Expo Go-compatible sharing path. The capture view must be
 * laid out (width/height > 0), collapsable={false}, with an opaque
 * background to avoid transparent-pixel artifacts.
 */
export async function captureAndShare(viewRef: RefObject<View | null>): Promise<void> {
  if (viewRef.current === null) {
    throw new Error('share view not mounted');
  }
  const uri = await captureRef(viewRef, {
    format: 'png',
    quality: 1,
    result: 'tmpfile',
  });
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('sharing unavailable on this device');
  }
  await Sharing.shareAsync(uri, {
    mimeType: 'image/png',
    UTI: 'public.png',
    dialogTitle: 'Daily Bread',
  });
}
