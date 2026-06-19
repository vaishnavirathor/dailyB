import { create } from 'zustand';

import { getCommunityRepository } from '@/community';
import type { CommunityMode, Profile } from '@/community/types';

export interface CommunityState {
  mode: CommunityMode;
  profile: Profile | null;
  /** True once ensureSession has resolved (success or failure). */
  ready: boolean;
  connect: () => Promise<void>;
  setDisplayName: (name: string) => Promise<void>;
}

/**
 * Session/profile state for the community features. `connect` is lazy —
 * called when a community screen first mounts, so the daily loop never
 * waits on the network.
 */
export const useCommunity = create<CommunityState>((set, get) => ({
  mode: getCommunityRepository().mode,
  profile: null,
  ready: false,

  connect: async () => {
    if (get().ready) {
      return;
    }
    const profile = await getCommunityRepository().ensureSession();
    set({ profile, ready: true, mode: getCommunityRepository().mode });
  },

  setDisplayName: async (name) => {
    await getCommunityRepository().updateDisplayName(name.trim());
    const current = get().profile;
    set({ profile: current ? { ...current, displayName: name.trim() } : current });
  },
}));
