import type { Tradition } from '@/content/types';

/**
 * Community domain — prayer wall, groups, parish service times.
 * Everything flows through CommunityRepository: the Supabase
 * implementation when backend keys are present, an offline seeded
 * preview otherwise. Screens never know which one they're talking to.
 */

export interface Profile {
  id: string;
  displayName: string;
}

export interface PrayerRequest {
  id: string;
  authorName: string;
  body: string;
  groupId: string | null;
  prayedCount: number;
  prayedByMe: boolean;
  mine: boolean;
  createdAt: string; // ISO
}

export interface Group {
  id: string;
  name: string;
  inviteCode: string;
  memberCount: number;
}

export interface Parish {
  id: string;
  name: string;
  city: string;
  tradition: Tradition;
}

export interface ServiceTime {
  id: string;
  parishId: string;
  weekday: number; // 0 = Sunday … 6 = Saturday
  time: string; // 'HH:MM' 24h
  label?: string; // e.g. "Telugu Mass"
}

export type CommunityMode = 'live' | 'preview';

export interface CommunityRepository {
  readonly mode: CommunityMode;
  /** Anonymous session + profile; null only on hard failure. */
  ensureSession(): Promise<Profile | null>;
  updateDisplayName(name: string): Promise<void>;

  // Prayer wall (groupId scopes to a group; null = public wall)
  listPrayerRequests(groupId: string | null): Promise<PrayerRequest[]>;
  postPrayerRequest(body: string, groupId: string | null): Promise<void>;
  togglePrayed(requestId: string): Promise<void>;
  reportRequest(requestId: string): Promise<void>;

  // Groups
  myGroups(): Promise<Group[]>;
  createGroup(name: string): Promise<Group>;
  joinGroup(inviteCode: string): Promise<Group | null>;
  leaveGroup(groupId: string): Promise<void>;

  // Parishes & service times
  listParishes(cityQuery: string): Promise<Parish[]>;
  parishTimes(parishId: string): Promise<ServiceTime[]>;
  submitParish(input: { name: string; city: string; tradition: Tradition }): Promise<void>;
  submitServiceTime(
    parishId: string,
    input: { weekday: number; time: string; label?: string },
  ): Promise<void>;
}
