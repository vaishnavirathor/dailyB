import { SignJWT } from 'jose';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase.js';
import { config } from '../lib/config.js';
import { logger } from '../lib/logger.js';
import { AppError, unauthorized, internal } from '../lib/errors.js';

const jwtSecret = new TextEncoder().encode(config.APP_JWT_SECRET);

export interface AuthResult {
  userId: string;
  token: string;
  verified: boolean;
}

export interface ProfileResult {
  id: string;
  display_name: string;
  gender: string | null;
  email: string | null;
  created_at: string;
}

export async function signUp(
  email: string,
  password: string,
  displayName?: string,
  gender?: string,
): Promise<AuthResult> {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: false,
    user_metadata: { display_name: displayName ?? '', gender: gender ?? null },
  });
  if (error) {
    if (error.message.includes('already registered')) {
      throw new AppError('EMAIL_EXISTS', 'An account with this email already exists', 409);
    }
    logger.error('sign-up failed', { err: error });
    throw new AppError('UPSTREAM_ERROR', error.message, 502);
  }
  const user = data.user;
  if (!user) throw internal('user creation returned empty');

  await supabase.from('profiles').upsert({
    id: user.id,
    display_name: displayName ?? '',
    gender: gender ?? null,
  }).maybeSingle();

  const token = await issueToken(user.id);
  logger.info('user signed up', { userId: user.id });
  return { userId: user.id, token, verified: false };
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    logger.warn('sign-in failed', { email });
    throw unauthorized('invalid email or password');
  }
  const user = data.user;
  if (!user) throw unauthorized();

  const verified = !!user.email_confirmed_at;
  const token = await issueToken(user.id);
  return { userId: user.id, token, verified };
}

export async function signInAnonymously(): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) {
    logger.error('anonymous sign-in failed', { err: error });
    throw new AppError('UPSTREAM_ERROR', error.message, 502);
  }
  const user = data.user;
  if (!user) throw internal('anonymous sign-in returned empty');
  const token = await issueToken(user.id);
  return { userId: user.id, token, verified: false };
}

export async function signInWithGoogle(accessToken: string): Promise<AuthResult> {
  const sb = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
  const { data: { user }, error } = await sb.auth.getUser(accessToken);
  if (error || !user) {
    logger.warn('google token verification failed', { err: error });
    throw unauthorized('invalid google token');
  }

  await supabase.from('profiles').upsert({
    id: user.id,
    display_name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? '',
    gender: user.user_metadata?.gender ?? null,
  }).maybeSingle();

  const token = await issueToken(user.id);
  return { userId: user.id, token, verified: !!user.email_confirmed_at };
}

export async function checkEmailVerified(userId: string): Promise<boolean> {
  const { data, error } = await supabase.auth.admin.getUserById(userId);
  const u = data?.user;
  if (error || !u) {
    throw new AppError('NOT_FOUND', 'user not found', 404);
  }
  return !!u.email_confirmed_at;
}

export async function resendVerification(email: string): Promise<void> {
  const { error } = await supabase.auth.admin.inviteUserByEmail(email, {
    redirectTo: 'dailybread://auth/verify',
  });
  if (error) {
    logger.error('resend verification failed', { email, err: error });
    throw new AppError('UPSTREAM_ERROR', error.message, 502);
  }
}

export async function getProfile(userId: string): Promise<ProfileResult> {
  const { data: authData, error: userError } = await supabase.auth.admin.getUserById(userId);
  const u = authData?.user;
  if (userError || !u) throw new AppError('NOT_FOUND', 'user not found', 404);

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, display_name, gender, created_at')
    .eq('id', userId)
    .single();

  if (profileError) {
    logger.warn('profile fetch failed, returning auth user data', { userId, err: profileError });
    return {
      id: u.id,
      display_name: (u.user_metadata as Record<string, string> | undefined)?.display_name ?? '',
      gender: (u.user_metadata as Record<string, string> | undefined)?.gender ?? null,
      email: u.email ?? null,
      created_at: u.created_at ?? '',
    };
  }

  return { ...profile, email: u.email ?? null };
}

export async function updateProfile(userId: string, data: { display_name?: string; gender?: string }) {
  const updates: Record<string, string> = {};
  if (data.display_name !== undefined) updates.display_name = data.display_name;
  if (data.gender !== undefined) updates.gender = data.gender;

  if (Object.keys(updates).length === 0) {
    throw new AppError('VALIDATION_ERROR', 'no fields to update', 400);
  }

  const { data: result, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select('id, display_name, gender, created_at')
    .maybeSingle();

  if (error) {
    logger.error('profile update failed', { userId, err: error });
    throw new AppError('UPSTREAM_ERROR', error.message, 502);
  }

  if (!result) {
    const { data: insertResult, error: insertError } = await supabase
      .from('profiles')
      .upsert({ id: userId, ...updates })
      .select('id, display_name, gender, created_at')
      .maybeSingle();

    if (insertError) {
      logger.error('profile upsert fallback failed', { userId, err: insertError });
      throw new AppError('UPSTREAM_ERROR', insertError.message, 502);
    }
    return insertResult;
  }

  return result;
}

export async function issueToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(jwtSecret);
}
