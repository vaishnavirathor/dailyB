# Daily Bread (దినసరి ఆహారం) — Complete Development Handoff

**Date:** 2026-06-07 · **State:** 43 commits on `main`, all green
(133/133 jest · tsc clean · eslint clean · Android Hermes export OK, ~18MB)
**Built across:** 2026-06-05 → 06-07, single Claude Code session series.

---

## 0. What this app is

Telugu-first Christian devotional app (Expo SDK 56), built from two source
documents (in `~/Downloads` on the old laptop, content captured in the
design doc): `DESIGN (2).md` — the "Warm Devotional" design system — and
`app-features-v2.html` — the feature blueprint (Daily Loop / Calendar /
Sharing / Habit & Community / Monetization / Roadmap).

The living spec is **`docs/superpowers/specs/2026-06-05-daily-bread-mvp-design.md`**
inside the repo — read it after this file. It has v1→v6 addendums matching
the build phases below.

---

## 1. Restore on the new laptop

```bash
# 1. Restore the repo (full history) from the bundle in this zip:
git clone daily-bread-repo.bundle daily-bread
cd daily-bread
git remote remove origin   # bundle remote; add your real remote when ready

# 2. Node 22+ (was built on v26). Install deps:
npm install

# 3. Secrets: copy env/.env from this zip into the repo root.
#    (.env is gitignored; see §5 for what's in it.)

# 4. Memory files: copy memory/* into the Claude Code project memory dir
#    on the new machine. The directory name encodes the PROJECT PATH:
#    ~/.claude/projects/<dash-encoded-project-path>/memory/
#    e.g. project at /Users/you/daily-bread →
#    ~/.claude/projects/-Users-you-daily-bread/memory/
#    (Open the project once in Claude Code to create the folder.)

# 5. Run:
npx expo start -c          # Expo Go (SDK 56) on the phone
# Verify health:
npx jest                   # 133 passing
npx tsc --noEmit
npx expo lint
```

---

## 2. The build journey (what exists and why)

| Phase | What landed |
|---|---|
| **v1 — MVP** | Daily loop (verse/promise/reflection/prayer-sheet+journal/plans), Protestant calendar (computus), share graphics (view-shot→share sheet), gentle streaks w/ grace days, local notifications, te/en onboarding, theme tokens 1:1 from the design doc, TDD'd domain layer |
| **v2 — full blueprint** | Catholic + Syro-Malabar liturgical layers (seasons engine, tested), India feasts (Velankanni, Dukrana), feast reminders, festival share cards (Clay + name personalization), lyrics library (scripture canticles + originals — zero-license policy), Faith Storefront (quiet commerce, **DMR-Act ComplianceNotice**, claim-language tests, WhatsApp-order), About/roadmap |
| **v3 — backend + drawer** | Hamburger drawer (tabs slimmed), **Supabase seam**: `CommunityRepository` live vs seeded `PreviewCommunityRepository` (auto by env), anonymous auth, `supabase/schema.sql` (RLS, trigger counters, report auto-hide), Prayer Wall, Groups (6-char invite codes), Mass/Service times (moderated), **UPI intent checkout** (Android `upi://pay`) |
| **v4 — library expansion** | **Full offline Telugu OV Bible** (66 books / 31,102 verses validated), favorites, Morning Ritual TTS autoplay, streak heatmap + bestStreak, real-verse 7-day notification window, SVG share scenes, verse memorization (seeded blanking, tested), journal export |
| **v5 — Bible as a book** | **English KJV-family edition** bundled (same canon shape), leather **bookshelf** chooser (two books on wood), `?v=` edition routing, version-scoped marks (sqlite v3), **3D page-turn reader** (spine-pivot leaf, momentum, paper styling) |
| **v6 — HD voice** | Device-TTS voice picker (gender heuristic + previews), then the **HD "pastor voice" pipeline**: `smartSpeak/smartSequence` orchestrator → Supabase edge fn `tts` (Azure/Sarvam/ElevenLabs, server keys, global `tts-cache` bucket = synthesize once ever) → expo-audio + on-device cache + prefetch; **DEV direct mode** for keyless-backend testing; read-aloud on Today/Bible-chapters(follow-along)/hymns/ritual |
| Extras | Daily Promise **Curtain** (full-screen once/day, omnidirectional cloth-pull dismiss) — now an **opt-in Settings toggle, default OFF**; web hardening (async sqlite, OPFS in-memory fallback, wasm metro config) |

---

## 3. Architecture map

```
src/
├── app/                    # expo-router v6 routes
│   ├── _layout.tsx         # fonts, async init, Stack.Protected gate
│   ├── (onboarding)/       # language → tradition → reminder
│   ├── (app)/              # DRAWER group
│   │   ├── _layout.tsx     # Drawer + DailyCurtain overlay
│   │   ├── (tabs)/         # Today · Bible(shelf) · Calendar · Share · Store
│   │   └── prayer-wall|groups|mass-times|favorites|lyrics|journal|memorize|settings|about
│   ├── bible/index (?v=) → [book]/ → [book]/[chapter] (page-turn reader)
│   ├── group|parish|journal|lyrics|plan|product/[id]
│   └── prayer (formSheet) · reader · milestone · ritual (modals)
├── bible/                  # books.ts (2 editions, lazy require maps) + data/ + data-en/
├── community/              # types · supabase-client/repository · preview-repository · invite-code
├── components/             # ThemedText (Telugu leading floor!) · VerseCard · icons (1.5px stroke set) …
├── content/                # ContentRepository seam + bundled (days/promises/plans/feasts/hymns/products/festivals)
├── data/                   # async sqlite (db.ts migrations v1–v3) · kv · journal/activity/plans/marks/favorites
├── domain/                 # PURE + tested: computus · liturgical · streaks · selection · milestones · memorize · dates
├── features/               # bible/book-cover · daily-curtain · share/canvas+scenes · settings/voice-picker · navigation/drawer …
├── services/               # notifications · tts (device) · hd-voice · voice (smart orchestrator) · share-capture
├── stores/                 # zustand: settings (persisted via kv bridge) · progress · community
├── i18n/                   # typed te/en dictionary
└── theme/                  # DESIGN.md tokens 1:1
supabase/
├── schema.sql              # full community schema + RLS + setup steps in header
└── functions/tts/index.ts  # multi-provider HD voice edge fn (Deno; excluded from app tsconfig)
```

**Dependency rule:** app → components/features/stores/services → domain/content/data.
`domain/` has zero RN imports. `ContentRepository`/`CommunityRepository` are
the server seams.

---

## 4. Critical institutional knowledge (gotchas that cost time)

1. **expo-router v6 (SDK 56) BANS `@react-navigation/*` imports** — bundler-enforced.
   Dispatch literal actions (`{type:'OPEN_DRAWER'}`); `expo-router/drawer` is self-contained.
2. **React Compiler lint is strict** (errors, not warnings):
   - Reanimated shared values: use `.set()/.get()`, never `.value =` in callbacks/worklets
   - `runOnJS` is deprecated → `scheduleOnRN` from `react-native-worklets`
   - No ref-touching callbacks captured by gesture builders → route through a state-watcher `useEffect`
   - No sync `setState` in `useEffect` bodies → prefer `useFocusEffect`/render-derived state
   - No mutable counters during render → derive via `useMemo`
3. **Web target**: expo-sqlite sync API times out (worker channel) → everything is the
   **async** API; OPFS multi-tab locks → `db.ts` falls back to in-memory on web;
   `metro.config.js` adds wasm + COOP/COEP. Web = degraded preview only; phone is the product.
4. **Typed routes** (`.expo/types/router.d.ts`) regenerate only while Metro runs —
   route-string tsc errors right after adding routes are usually staleness.
5. **Telugu rendering**: line-height floor ≥1.8× body / 1.6× display (Android clips
   conjuncts; worse on Android 15) — encoded in `ThemedText`; static font weights only.
6. **rtk shell hook** (old laptop): rewrote `npx` weirdly → `rtk proxy <cmd>` ran things raw.
   New laptop may not have rtk — plain commands then.
7. **Office network (Zscaler)** blocks the Sarvam TTS POST — test HD voice with the
   phone on **mobile data** (`npx expo start --tunnel` so Metro stays reachable).
8. **Testing affordances**: About → tap version line 5× re-arms the once-a-day Curtain;
   curtain itself is Settings-toggled (default OFF).
9. Daily rotation epoch `2026-01-01` in `domain/daily-selection.ts` — **never change once shipped**.

---

## 5. Secrets & env inventory

**`env/.env` in this zip** (drop into repo root; gitignored):
- `EXPO_PUBLIC_DEV_SARVAM_API_KEY` — Sarvam dev key. **It was pasted in chat:
  ROTATE it at dashboard.sarvam.ai after testing.** DEV direct mode only —
  never ship a build with `EXPO_PUBLIC_DEV_*` set (keys land in the JS bundle).

**`env/.env.example`** documents everything else:
- `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` — flips community
  features from offline-preview to live (project not created yet)
- Server-side (via `supabase secrets set`, NOT .env): `TTS_DEFAULT_PROVIDER`,
  `AZURE_SPEECH_KEY/REGION`, `SARVAM_API_KEY`, `ELEVENLABS_API_KEY` +
  `ELEVEN_VOICE_TE/EN` (future pastor clone)

**Placeholders to replace before launch** (`src/features/store/config.ts`):
`ORDER_WHATSAPP_NUMBER` (919999999999) and `STORE_UPI_VPA` (dailybread@upi).

---

## 6. Go-live checklists

**Supabase (community):** create project → Auth → enable **Anonymous sign-ins**
→ SQL editor: run `supabase/schema.sql` → paste URL+anon key into `.env` →
restart Metro. Moderation = dashboard table editor (parishes/times approve;
prayer requests auto-hide at 3 reports).

**HD voice:** `supabase functions deploy tts` → Storage: create **public**
bucket `tts-cache` → `supabase secrets set` provider keys → app Settings →
HD voice ON. Azure free F0 = 500K chars/month. Pastor clone later: record
~10 min of a **consenting** pastor → ElevenLabs Professional Clone → set
`ELEVEN_VOICE_TE/EN`.

---

## 7. Content review flags (before real launch)

- Telugu OV verses/reflections/prayers, hymn texts, feast names/dates,
  East-Syriac season boundaries → native speaker + pastor/liturgical review
- English Bible is KJV-family with deviations (e.g. Ps 23:1 "shall not lack")
- Only 14 daily entries (rotation wraps) → grow toward 365
- Storefront copy must stay claim-free — **tests enforce it** (DMR Act 1954)

## 8. Known-deferred (with reasons)

- Premium subscriptions / ads / IAP — need EAS dev builds + store accounts
- FCBH (Bible Brain) real human-narrated Telugu audio Bible — free ministry
  API, offered and parked; great future pairing for the reader
- Geo-based mass times, home-screen widgets, quick actions — dev-build items
- Lyrics: licensed community hymnal (AKK) — partnership/licensing first

## 9. Task state

All tracked tasks (#1–#49) completed. Nothing in flight. Last session ended
after: Sarvam key wired into `.env`, in-app A/B preview ready (Settings →
HD ▶), blocked from terminal verification only by office Zscaler.

## 10. This zip contains

| Path | What |
|---|---|
| `HANDOFF.md` | this file |
| `daily-bread-repo.bundle` | FULL git history — `git clone daily-bread-repo.bundle daily-bread` |
| `memory/` | Claude Code memory (MEMORY.md index + daily-bread-project.md) → see §1.4 |
| `env/.env` | live dev secrets (Sarvam key — rotate!) |
| `env/.env.example` | full env documentation |
| `docs/` | the v1→v6 design spec |
| `supabase/` | schema.sql + tts edge function (also in the bundle; here for quick reading) |
