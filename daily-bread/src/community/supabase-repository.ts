import { generateInviteCode, normalizeInviteCode } from '@/community/invite-code';
import { getSupabase } from '@/community/supabase-client';
import type {
  CommunityRepository,
  Group,
  Parish,
  PrayerRequest,
  Profile,
  ServiceTime,
} from '@/community/types';
import type { Tradition } from '@/content/types';

interface RequestRow {
  id: string;
  author_id: string;
  author_name: string;
  body: string;
  group_id: string | null;
  prayed_count: number;
  created_at: string;
}

interface GroupRow {
  id: string;
  name: string;
  invite_code: string;
}

/**
 * The live backend over Supabase: anonymous auth, RLS-guarded tables,
 * trigger-maintained counters and report-based auto-hiding (see
 * supabase/schema.sql).
 */
export class SupabaseCommunityRepository implements CommunityRepository {
  readonly mode = 'live' as const;

  private userId: string | null = null;
  private displayName = '';

  async ensureSession(): Promise<Profile | null> {
    try {
      const supabase = getSupabase();
      let session = (await supabase.auth.getSession()).data.session;
      if (!session) {
        session = (await supabase.auth.signInAnonymously()).data.session;
      }
      if (!session) {
        return null;
      }
      this.userId = session.user.id;

      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', this.userId)
        .maybeSingle();
      if (profile) {
        this.displayName = profile.display_name;
      } else {
        await supabase.from('profiles').insert({ id: this.userId, display_name: '' });
        this.displayName = '';
      }
      return { id: this.userId, displayName: this.displayName };
    } catch (error) {
      console.warn('[community] session failed', error);
      return null;
    }
  }

  async updateDisplayName(name: string): Promise<void> {
    this.displayName = name;
    if (this.userId) {
      await getSupabase()
        .from('profiles')
        .upsert({ id: this.userId, display_name: name });
    }
  }

  async listPrayerRequests(groupId: string | null): Promise<PrayerRequest[]> {
    const supabase = getSupabase();
    let query = supabase
      .from('prayer_requests')
      .select('id, author_id, author_name, body, group_id, prayed_count, created_at')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(50);
    query = groupId === null ? query.is('group_id', null) : query.eq('group_id', groupId);
    const { data, error } = await query;
    if (error) {
      throw error;
    }
    const rows = (data ?? []) as RequestRow[];

    let prayedSet = new Set<string>();
    if (this.userId && rows.length > 0) {
      const { data: taps } = await supabase
        .from('prayed_taps')
        .select('request_id')
        .eq('user_id', this.userId)
        .in(
          'request_id',
          rows.map((r) => r.id),
        );
      prayedSet = new Set((taps ?? []).map((t: { request_id: string }) => t.request_id));
    }

    return rows.map((row) => ({
      id: row.id,
      authorName: row.author_name || 'Friend',
      body: row.body,
      groupId: row.group_id,
      prayedCount: row.prayed_count,
      prayedByMe: prayedSet.has(row.id),
      mine: row.author_id === this.userId,
      createdAt: row.created_at,
    }));
  }

  async postPrayerRequest(body: string, groupId: string | null): Promise<void> {
    if (!this.userId) {
      throw new Error('no session');
    }
    const { error } = await getSupabase().from('prayer_requests').insert({
      author_id: this.userId,
      author_name: this.displayName || 'Friend',
      body,
      group_id: groupId,
    });
    if (error) {
      throw error;
    }
  }

  async togglePrayed(requestId: string): Promise<void> {
    if (!this.userId) {
      return;
    }
    await getSupabase()
      .from('prayed_taps')
      .upsert({ request_id: requestId, user_id: this.userId }, { ignoreDuplicates: true });
  }

  async reportRequest(requestId: string): Promise<void> {
    if (!this.userId) {
      return;
    }
    await getSupabase()
      .from('request_reports')
      .upsert({ request_id: requestId, user_id: this.userId }, { ignoreDuplicates: true });
  }

  async myGroups(): Promise<Group[]> {
    if (!this.userId) {
      return [];
    }
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('group_members')
      .select('groups ( id, name, invite_code )')
      .eq('user_id', this.userId);
    if (error) {
      throw error;
    }
    const groups = ((data ?? []) as unknown as { groups: GroupRow }[])
      .map((row) => row.groups)
      .filter(Boolean);

    return Promise.all(
      groups.map(async (g) => {
        const { count } = await supabase
          .from('group_members')
          .select('user_id', { count: 'exact', head: true })
          .eq('group_id', g.id);
        return { id: g.id, name: g.name, inviteCode: g.invite_code, memberCount: count ?? 1 };
      }),
    );
  }

  async createGroup(name: string): Promise<Group> {
    if (!this.userId) {
      throw new Error('no session');
    }
    const supabase = getSupabase();
    // Retry once on the (unlikely) invite-code collision.
    for (let attempt = 0; attempt < 2; attempt++) {
      const inviteCode = generateInviteCode();
      const { data, error } = await supabase
        .from('groups')
        .insert({ name, invite_code: inviteCode, created_by: this.userId })
        .select('id, name, invite_code')
        .single();
      if (error) {
        if (error.code === '23505') {
          continue; // unique violation → new code
        }
        throw error;
      }
      await supabase.from('group_members').insert({ group_id: data.id, user_id: this.userId });
      return { id: data.id, name: data.name, inviteCode: data.invite_code, memberCount: 1 };
    }
    throw new Error('could not create group');
  }

  async joinGroup(inviteCode: string): Promise<Group | null> {
    if (!this.userId) {
      return null;
    }
    const supabase = getSupabase();
    const { data } = await supabase
      .from('groups')
      .select('id, name, invite_code')
      .eq('invite_code', normalizeInviteCode(inviteCode))
      .maybeSingle();
    if (!data) {
      return null;
    }
    await supabase
      .from('group_members')
      .upsert({ group_id: data.id, user_id: this.userId }, { ignoreDuplicates: true });
    const { count } = await supabase
      .from('group_members')
      .select('user_id', { count: 'exact', head: true })
      .eq('group_id', data.id);
    return { id: data.id, name: data.name, inviteCode: data.invite_code, memberCount: count ?? 1 };
  }

  async leaveGroup(groupId: string): Promise<void> {
    if (!this.userId) {
      return;
    }
    await getSupabase()
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', this.userId);
  }

  async listParishes(cityQuery: string): Promise<Parish[]> {
    let query = getSupabase()
      .from('parishes')
      .select('id, name, city, tradition')
      .eq('approved', true)
      .order('city')
      .limit(50);
    const q = cityQuery.trim();
    if (q.length > 0) {
      query = query.or(`city.ilike.%${q}%,name.ilike.%${q}%`);
    }
    const { data, error } = await query;
    if (error) {
      throw error;
    }
    return (data ?? []) as Parish[];
  }

  async parishTimes(parishId: string): Promise<ServiceTime[]> {
    const { data, error } = await getSupabase()
      .from('service_times')
      .select('id, parish_id, weekday, time, label')
      .eq('parish_id', parishId)
      .eq('approved', true)
      .order('weekday')
      .order('time');
    if (error) {
      throw error;
    }
    return ((data ?? []) as { id: string; parish_id: string; weekday: number; time: string; label: string | null }[]).map(
      (row) => ({
        id: row.id,
        parishId: row.parish_id,
        weekday: row.weekday,
        time: row.time,
        label: row.label ?? undefined,
      }),
    );
  }

  async submitParish(input: { name: string; city: string; tradition: Tradition }): Promise<void> {
    if (!this.userId) {
      throw new Error('no session');
    }
    const { error } = await getSupabase()
      .from('parishes')
      .insert({ ...input, created_by: this.userId }); // approved=false → moderation
    if (error) {
      throw error;
    }
  }

  async submitServiceTime(
    parishId: string,
    input: { weekday: number; time: string; label?: string },
  ): Promise<void> {
    if (!this.userId) {
      throw new Error('no session');
    }
    const { error } = await getSupabase()
      .from('service_times')
      .insert({ parish_id: parishId, ...input, created_by: this.userId });
    if (error) {
      throw error;
    }
  }
}
