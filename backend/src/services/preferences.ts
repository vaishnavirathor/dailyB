import { supabase } from '../lib/supabase.js';
import { logger } from '../lib/logger.js';
import { AppError } from '../lib/errors.js';

export interface PreferencesRecord {
  language: string;
  tradition: string;
  font_scale: string;
  tts_gender: string;
  telugu_heading_font: string;
  telugu_body_font: string;
  english_heading_font: string;
  english_body_font: string;
  updated_at: string;
}

const DEFAULTS: PreferencesRecord = {
  language: 'te',
  tradition: 'protestant',
  font_scale: 'normal',
  tts_gender: 'auto',
  telugu_heading_font: 'Suranna_400Regular',
  telugu_body_font: 'NTR_400Regular',
  english_heading_font: 'PlayfairDisplay_600SemiBold',
  english_body_font: 'SourceSerif4_400Regular',
  updated_at: new Date().toISOString(),
};

export async function getPreferences(userId: string): Promise<PreferencesRecord> {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) {
    logger.error('get preferences failed', { userId, err: error });
    throw new AppError('UPSTREAM_ERROR', error.message, 502);
  }
  return data ?? DEFAULTS;
}

export async function upsertPreferences(
  userId: string,
  prefs: Partial<Omit<PreferencesRecord, 'updated_at'>>,
): Promise<PreferencesRecord> {
  const { data, error } = await supabase
    .from('user_preferences')
    .upsert({ user_id: userId, ...prefs, updated_at: new Date().toISOString() })
    .select('*')
    .single();
  if (error) {
    logger.error('upsert preferences failed', { userId, err: error });
    throw new AppError('UPSTREAM_ERROR', error.message, 502);
  }
  return data;
}
