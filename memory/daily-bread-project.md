---
name: daily-bread-project
description: "Daily Bread Telugu devotional Expo app — scope decisions, architecture, and launch caveats"
metadata: 
  node_type: memory
  type: project
  originSessionId: 223eb3fc-bb85-49c4-b94b-09658a1e8179
---

**Daily Bread (దినసరి ఆహారం)** — Telugu-first Christian devotional app in `/Users/shiva.tadigadapa/db` (Expo SDK 56, built 2026-06-05 from `~/Downloads/DESIGN (2).md` + `app-features-v2.html`).

Key decisions (user-confirmed):
- **v2 (same day, "build them also fully")**: all three calendar layers live (Catholic + East Syriac liturgical engine in domain/liturgical.ts, TDD), feast reminders, festival share cards (Clay + name personalization), lyrics library (scripture canticles + originals only — zero-risk policy; licensed hymnal = future partnership), Faith Storefront 5th tab with WhatsApp-to-order pilot (`features/store/config.ts` has placeholder number TODO) + DMR-Act ComplianceNotice + claim-language content tests, /about roadmap.
- **v3 (same day, "add everything + lightweight backend + hamburger")**: drawer navigation ((app) group, 4 tabs + drawer: community/library/app sections); Supabase backend behind `CommunityRepository` seam — live vs seeded `PreviewCommunityRepository` auto-selected by `EXPO_PUBLIC_SUPABASE_URL/ANON_KEY` in .env (go-live steps in supabase/schema.sql header); Prayer Wall, Groups (6-char invite codes), Mass/Service Times (moderated crowd-sourcing), UPI intent checkout (Android upi://pay, placeholder VPA in features/store/config.ts).
- **SDK 56 gotcha**: expo-router v6 bans `@react-navigation/*` imports (bundler check) — dispatch literal actions like `{type:'OPEN_DRAWER'}`; expo-router/drawer is self-contained.
- **Daily Promise Curtain** (user-requested daily hook): full-screen once-per-day promise overlay (kv `curtain-shown.v1` date key, pure gating fn) with gesture-driven cloth-lift dismiss in features/daily-curtain/. Reanimated 4 + React Compiler rules: use sharedValue.set()/.get() (not `.value =` in callbacks/worklets — lint react-hooks/immutability) and scheduleOnRN from react-native-worklets (runOnJS deprecated). Re-arm for testing: tap About version line 5×.
- **Still deferred (with reasons in design doc)**: Premium subscriptions/ads (store-billing + ad SDKs need dev builds & business accounts), recorded audio Bible (assets), geo-based mass times.
- **v4 (library expansion, user picked all 8)**: full offline Telugu OV Bible bundled (src/bible/, 9.8MB, validated 31,102 verses — tabs now Today/Bible/Calendar/Share/Store), favorites (payload snapshots), Morning Ritual TTS autoplay (/ritual), streak heatmap + bestStreak, real-verse 7-day notification window, drawn SVG share scenes (no photo licensing), verse memorization (seeded blanking, domain-tested), journal .txt export. Curtain now opt-in toggle (default OFF) in Settings.
- **React Compiler rules (lint-enforced)**: sharedValue `.set()/.get()` not `.value=`; no render-scope mutable counters (derive via useMemo); no sync setState in useEffect (prefer useFocusEffect or render-derived state).
- **HD pastor voice (2026-06-06 latest)**: multi-provider neural TTS behind smartSpeak/smartSequence (services/voice.ts) — Supabase edge fn `tts` (Azure Mohan/Shruti + Sarvam bulbul + ElevenLabs clone ids via server secrets, global tts-cache bucket = synthesize once ever), expo-audio playback + on-device sha cache + next-item prefetch, device-TTS fallback. Settings: HD switch + provider pick. Go-live: deploy fn, public tts-cache bucket, supabase secrets (steps in fn header). User chose all 3 providers; FCBH real audio Bible declined for now; pastor clone postponed. DEV direct mode exists for testing: EXPO_PUBLIC_DEV_AZURE_SPEECH_KEY/REGION or EXPO_PUBLIC_DEV_SARVAM_API_KEY in .env → device calls provider directly (never ship; edge fn wins when Supabase configured). '▶ HD' preview button in Settings.
- **Polish + voices (2026-06-06 later)**: shelf overlap fixed (names below the board, contact shadows, slim gilt); reader chrome cleaned (SVG BookmarkIcon, centered header, in-page hints, justified English); TTS v2 "pastor voice" — per-language voice picker with gender heuristic + previews in Settings (ttsGender/ttsVoiceTe/En persisted), speakSequence() powers chapter read-aloud with follow-along verse highlight + auto-scroll, plus promise/reflection/hymn listen controls. Compiler gotcha: don't capture ref-touching callbacks in gesture builders — route via a state-watcher effect.
- **Bible-as-a-book redesign SHIPPED (2026-06-06)**: two editions (te-ov navy / en-kjv burgundy — KJV-family text has minor deviations e.g. Ps 23:1 'lack', flagged for review) on a leather bookshelf tab; edition rides the `?v=` search param (defaults te-ov); marks/lastRead version-scoped (sqlite v3); reader turns chapters as 3D leaves (perspective + transformOrigin 'left center', chapter = local state, activeOffsetX/failOffsetY keeps verse scroll dominant). Bundle 18MB with both Bibles. Handoff doc deleted after landing.
- **User TODOs before launch**: real WhatsApp number + UPI VPA in features/store/config.ts; create Supabase project + paste keys; native-speaker content review.
- **Bundled content now, server later**: everything content-shaped goes through `ContentRepository` (src/content/types.ts) — swap `BundledContentRepository` for a remote one when the lightweight backend arrives (notifications/fresh content/community planned server-side later).
- **Stack A**: Expo Go-compatible, zero native modules; StyleSheet + typed tokens (no NativeWind — preview-only in SDK 56); async expo-sqlite API everywhere (sync API times out on web's worker channel).
- **Audio**: device TTS via expo-speech with te-IN voice-availability gate (Android fails silently without the voice pack); recorded voices later.
- Android + iOS treated equally; web degrades gracefully (no notifications/share/picker).

**Why:** the roadmap in the blueprint mandates "one region, one tradition" first; bundled content keeps tier-2/3 India offline-first.

**How to apply:** don't add features outside Phase 1 without asking; route all new content through the repository seam; keep Telugu body line-height ≥1.8× (Android clips Indic conjuncts); rotation epoch 2026-01-01 in daily-selection.ts must never change once shipped.

⚠️ Launch caveats: bundled Telugu scripture (14 days, Telugu OV/KJV) is flagged for native-speaker/pastor review; only 14 day-entries exist (rotation wraps) — needs 365 before real launch.
