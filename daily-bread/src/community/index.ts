import { PreviewCommunityRepository } from '@/community/preview-repository';
import { hasSupabaseConfig } from '@/community/supabase-client';
import { SupabaseCommunityRepository } from '@/community/supabase-repository';
import type { CommunityRepository } from '@/community/types';

let repository: CommunityRepository | null = null;

/**
 * The community seam: live Supabase backend when env keys exist,
 * offline seeded preview otherwise. Screens read `mode` to show the
 * preview banner — nothing else differs.
 */
export function getCommunityRepository(): CommunityRepository {
  if (repository === null) {
    repository = hasSupabaseConfig()
      ? new SupabaseCommunityRepository()
      : new PreviewCommunityRepository();
  }
  return repository;
}
