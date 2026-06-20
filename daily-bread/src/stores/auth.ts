import { create } from 'zustand';
import Storage from 'expo-sqlite/kv-store';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';

import { track, EventName, setAuthContext } from '@/services/app-tracking';

WebBrowser.maybeCompleteAuthSession();

const AUTH_KV_KEY = 'auth.v1';
const PROFILE_KV_KEY = 'profile.v1';

export interface Profile {
  id: string;
  display_name: string;
  gender: string | null;
  email: string | null;
  created_at: string;
}

export interface AuthState {
  token: string | null;
  userId: string | null;
  isAuthenticated: boolean;
  hydrated: boolean;
  profile: Profile | null;
  verified: boolean;

  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string, gender?: string) => Promise<{ verified: boolean }>;
  signInAnonymously: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  mergeAndSignUp: (anonymousUserId: string, email: string, password: string) => Promise<void>;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: { display_name?: string; gender?: string }) => Promise<void>;
  checkEmailVerified: () => Promise<boolean>;
  resendVerification: () => Promise<void>;
  signOut: () => Promise<void>;
  hydrate: () => Promise<void>;
}

const API_BASE = 'https://daily-bread-api-202a8cb-fxzeqvpy4a-uc.a.run.app/api/v1';

function parseErrorMessage(text: string): string {
  try {
    const parsed = JSON.parse(text);
    return parsed.error || text;
  } catch {
    return text;
  }
}

async function apiPost<T = Record<string, unknown>>(path: string, body: unknown, token?: string): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST', headers, body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(parseErrorMessage(text) || `request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

async function apiGet<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(parseErrorMessage(text) || `request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

async function apiPatch<T>(path: string, body: unknown, token: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(parseErrorMessage(text) || `request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

function persist(token: string, userId: string): void {
  setAuthContext(token, userId);
  Storage.setItem(AUTH_KV_KEY, JSON.stringify({ token, userId })).catch(() => {});
}

function persistProfile(profile: Profile): void {
  Storage.setItem(PROFILE_KV_KEY, JSON.stringify(profile)).catch(() => {});
}

function clearPersisted(): void {
  setAuthContext(null, null);
  Storage.removeItem(AUTH_KV_KEY).catch(() => {});
  Storage.removeItem(PROFILE_KV_KEY).catch(() => {});
}

const SUPABASE_PROJECT = 'roruesavqqgposspirpv';

export const useAuth = create<AuthState>((set, get) => ({
  token: null,
  userId: null,
  isAuthenticated: false,
  hydrated: false,
  profile: null,
  verified: false,

  signIn: async (email, password) => {
    const { userId, token, verified } = await apiPost<{ userId: string; token: string; verified: boolean }>(
      '/auth/sign-in', { email, password },
    );
    persist(token, userId);
    set({ token, userId, isAuthenticated: true, verified });
    track(EventName.SIGN_IN, {});
  },

  signUp: async (email, password, displayName, gender) => {
    const { userId, token, verified } = await apiPost<{ userId: string; token: string; verified: boolean }>(
      '/auth/sign-up', { email, password, display_name: displayName, gender },
    );
    persist(token, userId);
    set({ token, userId, isAuthenticated: true, verified });
    track(EventName.SIGN_UP, {});
    return { verified };
  },

  signInAnonymously: async () => {
    const { token, userId } = await apiPost<{ userId: string; token: string }>(
      '/auth/sign-in/anonymous', {},
    );
    persist(token, userId);
    set({ token, userId, isAuthenticated: false, verified: false });
    track(EventName.ANONYMOUS_START, {});
  },

  signInWithGoogle: async () => {
    const redirectUri = makeRedirectUri();
    const authUrl = `https://${SUPABASE_PROJECT}.supabase.co/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectUri)}`;

    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

    if (result.type !== 'success') {
      if (result.type === 'cancel' || result.type === 'dismiss') {
        throw new Error('Google sign-in was cancelled.');
      }
      throw new Error('Google sign-in failed. Please try again.');
    }

    const url = result.url;
    const params = new URLSearchParams(url.split('#')[1] ?? '');
    const accessToken = params.get('access_token');
    if (!accessToken) {
      throw new Error('Google sign-in failed. No access token received.');
    }

    const { userId, token, verified } = await apiPost<{ userId: string; token: string; verified: boolean }>(
      '/auth/google', { access_token: accessToken },
    );
    persist(token, userId);
    set({ token, userId, isAuthenticated: true, verified });
    track(EventName.SIGN_IN_GOOGLE, {});
  },

  mergeAndSignUp: async (anonymousUserId, email, password) => {
    const { userId, token, verified } = await apiPost<{ userId: string; token: string; verified: boolean }>(
      '/auth/merge', { anonymous_user_id: anonymousUserId, email, password },
    );
    persist(token, userId);
    set({ token, userId, isAuthenticated: true, verified });
    track(EventName.ANONYMOUS_MERGE, {});
  },

  fetchProfile: async () => {
    const { token } = get();
    if (!token) return;
    const profile = await apiGet<Profile>('/auth/profile', token);
    set({ profile });
    persistProfile(profile);
  },

  updateProfile: async (data) => {
    const { token } = get();
    if (!token) throw new Error('Not signed in');
    const profile = await apiPatch<Profile>('/auth/profile', data, token);
    set({ profile });
    persistProfile(profile);
    track(EventName.PROFILE_UPDATE, { display_name: data.display_name, gender: data.gender });
  },

  checkEmailVerified: async () => {
    const { token } = get();
    if (!token) return false;
    const { verified } = await apiGet<{ verified: boolean }>('/auth/verify-email', token);
    set({ verified });
    return verified;
  },

  resendVerification: async () => {
    const { profile } = get();
    if (!profile?.email) throw new Error('No email on file');
    await apiPost('/auth/resend-verification', { email: profile.email });
  },

  signOut: async () => {
    track(EventName.SIGN_OUT, {});
    clearPersisted();
    set({ token: null, userId: null, isAuthenticated: false, verified: false, profile: null });
  },

  hydrate: async () => {
    try {
      const raw = await Storage.getItem(AUTH_KV_KEY);
      if (raw) {
        const { token, userId } = JSON.parse(raw) as { token: string; userId: string };
        setAuthContext(token, userId);
        set({ token, userId, isAuthenticated: true, hydrated: true });
        const profileRaw = await Storage.getItem(PROFILE_KV_KEY);
        if (profileRaw) {
          set({ profile: JSON.parse(profileRaw) as Profile });
        }
        return;
      }
    } catch { /* corrupt — clean start */ }
    set({ hydrated: true });
  },
}));
