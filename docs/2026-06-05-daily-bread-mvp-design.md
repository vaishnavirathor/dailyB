# Daily Bread (దినసరి ఆహారం) — Phase 1 MVP Design

**Date:** 2026-06-05 · **Status:** Approved (user fast-tracked after Section 1) · **v2 addendum below (same day):** full blueprint build-out
**Sources:** `DESIGN (2).md` (Warm Devotional design system) + `app-features-v2.html` (feature blueprint)

## 1. Product scope

Telugu-first Christian devotional app. Phase 1 of the blueprint roadmap: *"Own one region, one tradition. Nail the daily loop plus the sharing engine."*

**In scope (MVP):**

| Family | Features |
|---|---|
| Daily Loop (Core · Sage) | Verse of the Day, Daily Promise (signature, Gold), Short Reflection, One-Tap Prayer + private journal, Reading Plans (short tracks), device-TTS audio, large-font reader |
| Calendar (Core · Navy-muted) | Protestant/Pentecostal layer only: Palm Sunday, Good Friday, Easter, Pentecost, Christmas, Watch Night, New Year (computed + fixed), feast reminders list |
| Sharing (Growth · Navy-muted) | 9:16 + 1:1 graphics for Verse / Promise / Good-Morning pack, watermark, OS share sheet |
| Habit (Core · Sage) | Gentle streaks with grace days, one batched morning reminder (local notification), 7/30/100 milestones with shareable cards |
| Languages | Telugu + English; language-first onboarding (language → tradition → reminder time) |

**Deferred:** storefront/UPI, prayer wall, family/church groups, lyrics library, Catholic & Syro-Malabar/Orthodox layers (shown as "coming soon" in onboarding), recorded audio Bible, ads/premium tiers, Mass times, backend.

**Decisions made with user:**
- Bundled content now, but everything content-shaped goes through a `ContentRepository` interface so a lightweight server can drive it later (notifications, fresh content, community).
- Android + iOS treated equally.
- Audio = device TTS (expo-speech) now; realistic voices later. Large-font mode ships now.
- Stack A: Expo Go-first, zero native modules.

## 2. Architecture research summary (verified 2026-06-05)

- Expo SDK 56 / RN 0.85 / Expo Router v6; native tabs still alpha → use stable JS Tabs.
- Whole MVP stack runs in Expo Go: expo-speech, view-shot + expo-sharing, expo-sqlite (+ kv-store), expo-notifications DAILY local trigger, useFonts.
- Telugu TTS: no availability guarantee on Android — must gate via `Speech.getAvailableVoicesAsync()` and hide/fallback when te-IN voice missing (silent-failure bug pattern).
- Telugu text clips on Android (worse on Android 15) when lineHeight ≤ fontSize → enforce ≥1.5–1.8× leading in the Text primitive (design already mandates 1.8 for body).
- Variable fonts unreliable on Android → static weights for Source Serif 4 (400/600), Noto Serif (400/600/700), Noto Serif Telugu (400/600/700), Inter (400/500/600).
- Share images: render offscreen `<View collapsable={false}>` (absolute, off-viewport, opaque background), `captureRef` → PNG tmpfile → `Sharing.shareAsync`. Direct-to-WhatsApp-Status intent needs react-native-share + dev build → deferred.
- NativeWind v5 is preview with heavy boilerplate in SDK 56 → plain StyleSheet + typed tokens.
- Persistence: expo-sqlite for structured data; `expo-sqlite/kv-store` for key-value (single engine, Expo Go ✓). MMKV deferred (needs dev build).

## 3. Layered architecture

```
src/
├── app/                  # Expo Router routes (thin)
│   ├── _layout.tsx       # fonts, splash hold, db init, onboarding gate, light theme
│   ├── (onboarding)/     # language → tradition → reminder
│   ├── (tabs)/           # today · calendar · share · more
│   ├── plan/[id].tsx     # reading-plan detail
│   ├── reader.tsx        # large-font reader (modal)
│   ├── prayer.tsx        # one-tap prayer sheet (formSheet)
│   └── journal/[id].tsx  # journal entry detail
├── theme/                # DESIGN.md tokens 1:1 + useTheme
├── components/           # ThemedText (Telugu-aware leading), Button, Card, Chip,
│                         # IconTile, VerseCard, PromiseCard, ScreenHeader, icons/
├── content/              # types.ts, ContentRepository (interface), bundled/ (impl + JSON te/en)
├── domain/               # PURE: computus, daily-selection, streaks, milestones, dates
├── data/                 # sqlite init/migrations, journal-repo, activity-repo,
│                         # plan-progress-repo, kv (settings, flags)
├── services/             # notifications, tts (voice gate), share-capture
├── stores/               # zustand: settings, progress
└── i18n/                 # typed UI strings te/en
```

**Dependency rule:** `app → components/stores/services → domain/content/data → (nothing)`. `domain/` has zero RN imports — fully unit-testable.

**Future server seam:** `ContentRepository` (verses/promises/reflections/plans/feasts) is the only place content enters; swap `BundledContentRepository` → `RemoteContentRepository` without touching screens.

## 4. Navigation & screens

Tabs (frosted-glass bar: expo-blur, navy 1.5px-stroke SVG icons, gold active):

1. **Today** — date header (localized weekday), streak pill (Sage, progress-forward), VerseCard (TTS ▶ + share), PromiseCard (gold-tint gradient, 24px radius — visually distinct), Reflection (Clay drop accent, body-lg, Stack-LG), plan chips row (thin Sage progress track), One-Tap Prayer primary button → prayer formSheet (guided prayer + Amen + optional journal note). Viewing records `verse_seen`; Amen records `prayed`.
2. **Calendar** — month grid (today = gold underdot, selected = navy circle w/ white), feast markers, upcoming-feasts list with gentle reminder copy, feast detail (name, date, verse).
3. **Share** — template picker (Verse / Promise / Good Morning), 9:16 ↔ 1:1 toggle, live preview (Sage→warm-white gradient card, safe-area margins, telugu-display type, low-opacity wordmark watermark), Share button → offscreen 1080px capture → share sheet.
4. **More** — journal list (+ detail/delete), settings (language, reminder time picker, font scale normal/large/XL, tradition row [Protestant active; others "coming soon"], TTS availability hint), about. Milestone celebration sheet auto-presents at 7/30/100 (shareable card).

Onboarding (gate: kv `onboardingComplete`): 1) bilingual language pick (తెలుగు / English cards) → 2) tradition (Protestant/Pentecostal selectable; Catholic, Syro-Malabar/Orthodox disabled "coming soon") → 3) reminder time + permission (skippable).

## 5. Data model

**SQLite** (`daily-bread.db`):
- `journal_entries(id INTEGER PK AUTOINCREMENT, entry_date TEXT, body TEXT, created_at TEXT)`
- `activity(entry_date TEXT PK, verse_seen INTEGER DEFAULT 0, reflection_read INTEGER DEFAULT 0, prayed INTEGER DEFAULT 0)`
- `plan_progress(plan_id TEXT, day_index INTEGER, completed_at TEXT, PRIMARY KEY(plan_id, day_index))`

**KV (expo-sqlite/kv-store):** `settings` JSON {language, tradition, reminderTime, fontScale, notificationsEnabled}; `onboardingComplete`; `milestonesCelebrated` (array).

**Bundled content JSON (te + en in one record):**
- `verses.json`: `{id, ref:{en,te}, text:{en,te}}[]` — public-domain translations (Telugu OV 1880s / WEB-KJV English)
- `promises.json`: `{id, category: hope|provision|healing|victory, ref, text}[]`
- `reflections.json`: `{id, title:{en,te}, body:{en,te}}[]` (60–90s reads, original)
- `plans.json`: `{id, title, days:[{ref, text, thought}]}[]` — two 7-day plans
- `feasts.protestant.json`: fixed-date feasts; movable feasts computed

⚠️ **Content caveat (flagged for launch):** bundled scripture text is starter content assembled from public-domain translations; must be reviewed by a native Telugu speaker / pastor before release. Selection wraps modulo content length until a full 365-day set exists.

## 6. Domain rules (pure, tested)

- **Daily selection:** deterministic `date → index` (days since fixed epoch, modulo collection length, per collection offset) — same content for everyone on a date, offline, no server.
- **Computus:** Anonymous Gregorian algorithm → Easter; Palm Sunday −7d, Good Friday −2d, Pentecost +49d. Tested against known dates 2024–2031.
- **Streaks:** day completed when `verse_seen`. Current streak walks back from today (today incomplete doesn't break it). **Grace:** a single-day gap auto-bridges if flanked by completed days, max one bridge per rolling 7 days; rendered progress-forward in Sage, never loss-framed.
- **Milestones:** fire once each at 7/30/100 (kv-deduped) → celebration sheet + shareable card.

## 7. Services

- **notifications:** request permission; Android channel "daily"; schedule one `DAILY {hour,minute}` local notification (calm copy, localized); cancel+reschedule on time change; no exact-alarm permission (batching slack acceptable, avoids Play policy scrutiny).
- **tts:** `getAvailableVoicesAsync()` on first use → prefer Enhanced te-IN voice; if absent, hide play control + one-time hint (Settings row explains Google TTS Telugu pack). English always available. Chunk to `maxSpeechInputLength`; stop on unmount/navigation.
- **share-capture:** offscreen template at fixed dp size scaled to 1080px export; PNG tmpfile; `expo-sharing` sheet; errors → gentle toast, never crash.

## 8. Error handling

- Root ErrorBoundary with reverent fallback (verse + "restart" button).
- Repository/content failures: every getter returns a value or a typed miss; screens render calm empty states, never spinners-forever.
- SQLite ops wrapped; journal write failure → retry + toast; activity flags fire-and-forget with console warning.
- Permission denials are first-class states (notifications off → settings hint row; TTS unavailable → hidden control), not errors.

## 9. Testing

- **Domain (jest, exhaustive):** computus known-dates table; streak scenarios (fresh, unbroken, gap+grace, two gaps in 7d, repair-by-reading); selection determinism + wrap; milestone edges (6→7, re-fire prevention).
- **Content validation test:** every collection non-empty; all records have te+en; every date in a sampled year resolves a verse/promise/reflection; plan days complete.
- **Data:** repo CRUD against in-memory sqlite (jest-expo).
- **Manual:** Expo Go on Android + iOS — Telugu rendering (no clipping), TTS gate both outcomes, share output pixel-check, notification fire, onboarding gate.
- Gates: `jest` green, `tsc --noEmit` clean, `expo lint` clean, Metro bundles.

## v2 addendum — full blueprint build-out (user: "build them also fully")

**Added, fully client-side and offline-first:**

| Feature | Implementation |
|---|---|
| Catholic calendar layer | `domain/liturgical.ts` (TDD): Advent start, Ash Wednesday, Ascension, Trinity, Corpus Christi (India Sunday observance, Easter+63), Christ the King; season classifier (Advent/Christmastide/Lent/Holy Week/Eastertide/Ordinary); solemnities + Marian + India feasts data with curated reading refs |
| Syro-Malabar/Orthodox layer | East Syriac nine-season framework anchored on Easter/Christmas (Subara→Qudas Edta); Dukrana, Denha, Sliba, Pesaha, Peturta; ⚠️ flagged for liturgical review |
| Tradition switcher | Live in onboarding + More settings (segmented); calendar, seasons, feasts, reminders all tradition-aware |
| Season banners | Calendar tab, palette tints only (Lent→navy, Eastertide→gold, Ordinary→sage) |
| Feast & fast reminders | Up to 4 batched day-before 8:00 local notifications for gold feasts; identifier-scoped; reconciled via settings subscription + every launch |
| Festival & Occasion cards | Christmas/Easter/Good Friday/feast share templates, Clay accent, name personalization ("With prayers — N"), auto-suggested within feast windows |
| Worship Lyrics Library | Zero-risk hymnal policy: scripture canticles (Telugu OV) + Daily Bread originals, parallel te/transliteration display, refrain highlight; licensed community hymnal (AKK, Malayalam/Tamil) = future partnership |
| Faith Storefront | 5th tab, quiet commerce: curated catalog (Bibles/frames/rosaries/candles/devotional), label-md prices, category chips, product detail, **ComplianceNotice on the oil class (DMR Act 1954)** + faith-object line; content tests enforce zero claim language (en+te); **WhatsApp-to-order** pilot (`features/store/config.ts`, TODO real number) |
| Roadmap surface | `/about` — phased rows per design (italic serif tags, pills, hairline rules) |

**Deferred with reasons (seams ready):**
- **Prayer Requests Wall, Family & Church Groups, Local Mass times** — require the backend (community semantics can't be faked locally); repository-seam pattern established for when it lands.
- **UPI in-app checkout, Diaspora Premium, Ad tiers** — require merchant/IAP/ad SDK integrations (native modules → dev builds) and business accounts; WhatsApp-order pilot bridges commerce until then.
- **Recorded Audio Bible** — needs real licensed audio assets; device TTS remains the bridge.

## v3 addendum — community backend + drawer navigation (user: "add everything, add a lightweight backend, hamburger if needed")

**Navigation restructure:** hamburger Drawer (`(app)` group) wraps the tab group; tabs slimmed to Today/Calendar/Share/Store; Journal/Settings/About/Lyrics + new community screens live in the drawer (custom Warm-Devotional content; sections Community/Library/App). SDK 56 gotcha encoded in `components/menu-button.tsx`: expo-router v6 forked react-navigation and the bundler **bans `@react-navigation/*` imports** — drawer actions are dispatched as literal `{ type: 'OPEN_DRAWER' }` objects.

**Lightweight backend = Supabase free tier** (zero servers), behind `CommunityRepository`:
- `SupabaseCommunityRepository` (live) ⟷ `PreviewCommunityRepository` (seeded in-memory) — auto-selected by presence of `EXPO_PUBLIC_SUPABASE_URL/ANON_KEY` (.env). Preview keeps every screen fully interactive in Expo Go with a quiet banner.
- **Go-live steps** (also in supabase/schema.sql header + .env.example): create Supabase project → enable Anonymous sign-ins → run `supabase/schema.sql` in the SQL editor → paste URL + anon key into `.env` → restart Metro.
- Schema: profiles, groups + group_members (RLS via security-definer `is_group_member`), prayer_requests + prayed_taps + request_reports (trigger-maintained counters; **auto-hide at 3 reports**, manual moderation via dashboard), parishes + service_times (submit-unapproved moderation). Anonymous auth, kv-store as the auth storage.

**Features shipped:**
| Feature | Notes |
|---|---|
| Prayer Requests Wall | post (one-time display-name prompt), "I prayed" once-per-user taps, quiet report, pull-to-refresh, group-scoped reuse |
| Family & Church Groups | create → 6-char unambiguous invite code (tested), join by code, share-invite sheet (acquisition lever), group prayer wall, leave |
| Local Mass & Service Times | searchable parish list, weekday-grouped timings, tradition-aware word (Mass/Qurbana/Service), crowd submissions → moderation |
| UPI-first checkout | Android `upi://pay` intent (NPCI params, configurable VPA placeholder), WhatsApp fallback; iOS/web stay WhatsApp-primary |

**Still genuinely blocked:** Diaspora Premium subscriptions & ad tiers (store-billing/ad SDKs require dev builds + business accounts), recorded Audio Bible (licensed assets). Mass-times geo-proximity (needs location permission strategy — text search ships first).

## v4 addendum — library expansion (user picked all 8)

| Feature | Implementation |
|---|---|
| **Full Telugu Bible** | Public-domain OV bundled offline (godlytalias/Bible-Database; validated 66 books, canonical chapter counts, 31,102 verses; 9.8MB → app bundle 13MB, accepted for offline-first). Bible TAB (now 5: Today/Bible/Calendar/Share/Store): continue-reading, OT/NT lists, chapter grid, whole-book search, reader with tap-to-cycle highlights (sage→gold), chapter bookmarks, last-read kv. sqlite migration v2. |
| Favorites | Hearts on Today cards + hymns; long-press Bible verses; payload-snapshot sqlite repo; drawer screen with share/remove |
| Morning Ritual | /ritual fullScreenModal: TTS-narrated auto-advancing slides (verse→promise→reflection→prayer), reading-time fallback, Amen records flags; gold pill on Today |
| Streak heatmap | Month dot-grid on Calendar (sage read / gold-ring grace / navy-outline today) + current/best/total; `bestStreak` domain fn tested |
| Real-verse notifications | Rolling 7-day DATE-trigger window carrying each day's actual verse; resynced every launch; legacy repeating id cancelled |
| Scenic share backgrounds | 4 drawn SVG scenes (sunrise/leaves/sea/Bethlehem stars) under the 40% warm-white overlay — zero photo licensing risk |
| Verse memorization | Seeded progressive blanking (1/3→2/3→all; pure fns, 5 tests), word-bank chips, level-up flow; sources: today's verse + favorites |
| Journal export | expo-file-system File API → .txt → share sheet |

Also: **Daily Promise Curtain became an opt-in Settings toggle (default off)** per user. React Compiler rules captured: no `.value=` writes (use `.set()/.get()`), no render-scope counters, no setState-in-effect (use useFocusEffect/derived state).

## v5 addendum — the Bible as a real book (2026-06-06)

- **Two editions on a shelf**: Telugu OV (navy leather) + English KJV-family (burgundy) — `bibleVersions` metadata; English data validated (66 books, 31,102 verses, 4MB; minor KJV deviations like Ps 23:1 'lack' flagged for review). App bundle now 18MB with both.
- **Bookshelf tab**: leather `BookCover` (gradient + sheen, spine bands, embossed gold frame/cross/title, gilded fore-edge, ribbon, press-in spring, staggered entrance) standing on a wooden board; edition-aware continue-reading + bookmark chips.
- **Edition routing**: `?v=` search param everywhere (no route restructure; old links default te-ov); marks/lastRead version-scoped (sqlite v3 rebuilt PKs, old rows migrated as te-ov).
- **Page-turn reader**: chapter is local state; horizontal swipe rotates the leaf around the spine (perspective 1600 + `transformOrigin: 'left center'`), incoming page beneath, lighting both sides, 42%/flick commit with velocity passthrough, paper page on a desk backdrop with gutter shading and ghost numeral; verse scroll wins via activeOffset/failOffset; reduced-motion crossfade.

## v6 addendum — HD "pastor voice" pipeline (2026-06-06)

Device TTS caps at robotic; real-human quality comes from neural providers behind one seam:
- **Edge function `supabase/functions/tts`** (Deno): Azure neural (te-IN Mohan/Shruti, en-IN Prabhat/Neerja, SSML rate −6%), Sarvam bulbul:v2, ElevenLabs multilingual (cloned voice ids via `ELEVEN_VOICE_TE/EN`) — keys are server secrets; global **storage cache** in public `tts-cache` bucket means each utterance is synthesized once ever.
- **Client**: expo-audio playback (plays-in-silent) + sha-keyed on-device file cache; `smartSpeak/smartSequence` orchestrator — HD when enabled+reachable with next-item prefetch (no gaps between verses), graceful mid-sequence degrade to device TTS offline.
- **Settings**: HD voice switch + provider segmented; existing gender/voice prefs feed the HD gender too.
- **Go-live**: deploy fn → create public `tts-cache` bucket → `supabase secrets set` provider keys (steps in fn header + .env.example). For the literal pastor: record ~10 min of a consenting pastor, clone in ElevenLabs, set the voice ids.
- All read-aloud surfaces (Today, Bible chapters with follow-along, hymns, ritual) flow through the orchestrator.

## 10. Design-system compliance notes

- Tokens transcribed 1:1 from DESIGN (2).md frontmatter (colors, typography incl. `telugu-display`/`telugu-body`, radii, spacing).
- ThemedText enforces Telugu leading floor (≥1.8 body / ≥1.6 display) by variant + language.
- Gold never used for body text on warm white (decorative/labels only); navy-on-cream and gold-on-navy AA pairs per spec.
- Commerce absent in MVP; semantic accents: Sage (daily loop), Gold (promise + milestones), Navy-muted (calendar/share chrome), Clay (reflection accent, festival later), Error red reserved.
- OS font scaling respected (`maxFontSizeMultiplier` ceilings where layout-critical); in-app font-scale setting multiplies reader type.
