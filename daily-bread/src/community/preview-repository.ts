import { generateInviteCode, normalizeInviteCode } from '@/community/invite-code';
import type {
  CommunityRepository,
  Group,
  Parish,
  PrayerRequest,
  Profile,
  ServiceTime,
} from '@/community/types';
import type { Tradition } from '@/content/types';

/**
 * Offline preview backend: seeded, in-memory, fully interactive. Lets the
 * whole community surface work in Expo Go before a Supabase project
 * exists. Data resets on app restart — the UI shows a preview banner.
 */
export class PreviewCommunityRepository implements CommunityRepository {
  readonly mode = 'preview' as const;

  private profile: Profile = { id: 'preview-user', displayName: '' };

  private requests: (PrayerRequest & { reports: number })[] = [
    {
      id: 'pr1',
      authorName: 'మరియమ్మ',
      body: 'మా అబ్బాయి ఉద్యోగ ఇంటర్వ్యూ ఈ వారం ఉంది — జ్ఞానం కోసం ప్రార్థించండి.',
      groupId: null,
      prayedCount: 12,
      prayedByMe: false,
      mine: false,
      createdAt: new Date(Date.now() - 3 * 3600_000).toISOString(),
      reports: 0,
    },
    {
      id: 'pr2',
      authorName: 'Samuel',
      body: 'Please pray for my mother’s peace of mind as she recovers at home.',
      groupId: null,
      prayedCount: 8,
      prayedByMe: false,
      mine: false,
      createdAt: new Date(Date.now() - 9 * 3600_000).toISOString(),
      reports: 0,
    },
    {
      id: 'pr3',
      authorName: 'దేవదానం',
      body: 'మా గ్రామ సంఘ కట్టడం పనులు సజావుగా జరగాలని ప్రార్థన చేయండి.',
      groupId: null,
      prayedCount: 21,
      prayedByMe: false,
      mine: false,
      createdAt: new Date(Date.now() - 26 * 3600_000).toISOString(),
      reports: 0,
    },
  ];

  private groups: Group[] = [
    { id: 'g1', name: 'మా కుటుంబ ప్రార్థన', inviteCode: 'DEMO42', memberCount: 5 },
  ];
  private joined = new Set<string>();

  private parishes: Parish[] = [
    { id: 'p1', name: "St. Mary's Basilica", city: 'Secunderabad', tradition: 'catholic' },
    { id: 'p2', name: 'Centenary Baptist Church', city: 'Hyderabad', tradition: 'protestant' },
    { id: 'p3', name: 'St. Thomas Syro-Malabar Church', city: 'Hyderabad', tradition: 'orthodox' },
    { id: 'p4', name: 'CSI Christ Church', city: 'Vijayawada', tradition: 'protestant' },
  ];

  private times: ServiceTime[] = [
    { id: 't1', parishId: 'p1', weekday: 0, time: '06:00', label: 'Telugu Mass' },
    { id: 't2', parishId: 'p1', weekday: 0, time: '08:30', label: 'English Mass' },
    { id: 't3', parishId: 'p1', weekday: 6, time: '18:00', label: 'Vigil Mass' },
    { id: 't4', parishId: 'p2', weekday: 0, time: '09:00', label: 'తెలుగు ఆరాధన' },
    { id: 't5', parishId: 'p2', weekday: 0, time: '18:30', label: 'Youth Service' },
    { id: 't6', parishId: 'p3', weekday: 0, time: '07:30', label: 'Qurbana' },
    { id: 't7', parishId: 'p4', weekday: 0, time: '08:00', label: 'తెలుగు ఆరాధన' },
  ];

  async ensureSession(): Promise<Profile> {
    return this.profile;
  }

  async updateDisplayName(name: string): Promise<void> {
    this.profile = { ...this.profile, displayName: name };
  }

  async listPrayerRequests(groupId: string | null): Promise<PrayerRequest[]> {
    return this.requests
      .filter((r) => r.groupId === groupId && r.reports < 3)
      .map(({ reports: _reports, ...request }) => request)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async postPrayerRequest(body: string, groupId: string | null): Promise<void> {
    this.requests.unshift({
      id: `pr${Date.now()}`,
      authorName: this.profile.displayName || 'Friend',
      body,
      groupId,
      prayedCount: 0,
      prayedByMe: false,
      mine: true,
      createdAt: new Date().toISOString(),
      reports: 0,
    });
  }

  async togglePrayed(requestId: string): Promise<void> {
    const request = this.requests.find((r) => r.id === requestId);
    if (request && !request.prayedByMe) {
      request.prayedByMe = true;
      request.prayedCount += 1;
    }
  }

  async reportRequest(requestId: string): Promise<void> {
    const request = this.requests.find((r) => r.id === requestId);
    if (request) {
      request.reports += 3; // preview: a single report hides it
    }
  }

  async myGroups(): Promise<Group[]> {
    return this.groups.filter((g) => this.joined.has(g.id));
  }

  async createGroup(name: string): Promise<Group> {
    const group: Group = {
      id: `g${Date.now()}`,
      name,
      inviteCode: generateInviteCode(),
      memberCount: 1,
    };
    this.groups.push(group);
    this.joined.add(group.id);
    return group;
  }

  async joinGroup(inviteCode: string): Promise<Group | null> {
    const code = normalizeInviteCode(inviteCode);
    const group = this.groups.find((g) => g.inviteCode === code);
    if (!group) {
      return null;
    }
    if (!this.joined.has(group.id)) {
      this.joined.add(group.id);
      group.memberCount += 1;
    }
    return group;
  }

  async leaveGroup(groupId: string): Promise<void> {
    if (this.joined.delete(groupId)) {
      const group = this.groups.find((g) => g.id === groupId);
      if (group) {
        group.memberCount = Math.max(0, group.memberCount - 1);
      }
    }
  }

  async listParishes(cityQuery: string): Promise<Parish[]> {
    const q = cityQuery.trim().toLowerCase();
    return this.parishes.filter(
      (p) => q.length === 0 || p.city.toLowerCase().includes(q) || p.name.toLowerCase().includes(q),
    );
  }

  async parishTimes(parishId: string): Promise<ServiceTime[]> {
    return this.times
      .filter((t) => t.parishId === parishId)
      .sort((a, b) => a.weekday - b.weekday || a.time.localeCompare(b.time));
  }

  async submitParish(input: { name: string; city: string; tradition: Tradition }): Promise<void> {
    // Preview submissions appear immediately (no moderators around).
    this.parishes.push({ id: `p${Date.now()}`, ...input });
  }

  async submitServiceTime(
    parishId: string,
    input: { weekday: number; time: string; label?: string },
  ): Promise<void> {
    this.times.push({ id: `t${Date.now()}`, parishId, ...input });
  }
}
