# Changelog

## [1.0.0] — 2026-07-12
### Added — multi-tenant release (open to any couple)
- Accounts (Supabase magic-link) and couple pairing via invite code/link;
  RLS-isolated per-couple data for media, moments, quiz answers, locations,
  settings and push subscriptions. Instant partner sync (no CDN lag).
- Per-couple cities: search any city (open-meteo geocoding); clocks,
  overlap, converter, map, weather, holidays and exchange rate follow the
  pair. Default avatars use country flags.
- Onboarding welcome card (sign-in → pair → cities), Terms & Privacy pages
  (ja/en/es), JWT-verified account deletion, one-tap legacy data import
  for the original couple.
- Legacy single-couple mode still works when signed out.

## [0.11.0] — 2026-07-09
### Added
- **Cloud backup & restore**: shared settings (anniversaries, dates,
  schedules) auto-back up to Cloudinary on every change; one-tap restore
  per side in More — survives phone changes and cleared browser data.
- **Quiz history**: ‹ date › navigation on the psych test (30 days back);
  past days show both answers read-only (answering is same-day only).
- **Memories gallery**: newest-first thumbnail grid (with video thumbnails)
  under the random viewer; tap to open.
- **Weather on sky cards**: current temp + condition emoji and
  sunrise/sunset for both cities via open-meteo (keyless, 30-min cache).
- **Anniversary confetti**: once-a-day celebration overlay when today is
  an anniversary, the dating-anniversary, or reunion day.
- In-site translation (previous deploy): browser Translator API with
  MyMemory fallback; Google Translate link only as last resort.

## [0.10.0] — 2026-07-09
### Added
- **Daily psych test** (`/quiz`, Home card): 30 classic projective tests
  (ja/es bilingual, ~monthly rotation). One test per Tokyo day, chosen
  deterministically so both sides get the same one; the reveal and the
  partner's answers stay locked until you submit yours. Answers are stored
  as context metadata on Cloudinary placeholder images — still no backend.
### Changed
- AI assistant replaced with a zero-cost tools page: Google Translate
  hand-off (auto ja⇄es) + 32 curated bilingual conversation starters and
  long-distance date ideas. The Claude-API version (v0.9.0) remains in git
  history for potential revival.

## [0.8.0] — 2026-07-08
### Added
- **Exchange rate card** (Home): ¥1,000 ⇄ CLP both directions, daily-cached,
  via open.er-api.com (no key).
- **Holidays card** (Home): next 5 public holidays across Japan and Chile
  with local names, flags and days-until, via date.nager.at (cached per year).
- **Moment streak**: 🔥 pill showing consecutive days on which both sides
  posted. Past days cached permanently; an incomplete today doesn't break
  the streak.
- **Past-day browsing** on Moment: ‹ date › navigation up to 30 days back;
  uploads always file to today and jump the view back. 2 new tests (27 total).

## [0.7.1] — 2026-07-08
### Changed
- Moment feed redesign: newest-first vertical timeline; full-bleed square
  media cards with glass time/city pills overlaid on the photo; photo-less
  hours collapse to one thin line with 😴 sleep markers; camera FAB above
  the bottom nav replaces the top button card.
### Added
- Short-video moments: image/video uploads (25MB cap) — clips autoplay
  muted and loop in the feed.
- Notification fixes: SW-based delivery (required on iOS PWA), clearer
  unsupported/denied guidance, test-notification button in More.

## [0.7.0] — 2026-07-07
### Changed
- **Same Moment redesign — hourly timeline.** Photos now file into hour
  buckets by the instant they were taken (Tokyo-hour based, so Tokyo 20時台
  = Santiago 07時台 is one shared slot). An hour slider (0–23, dual label
  🗼20:00 ／ 🏔️07:00) browses the day; empty slots stay open; hours where a
  side is asleep (per wake/sleep settings) show 😴. Photos are visible
  immediately — the both-sides unlock was dropped for hourly cadence
  (friction; may return as a daily-special with streaks).
- Each photo is captioned in its own city's local time (JST for Tokyo shots,
  CLT/CLST for Santiago shots).
### Added
- Hourly notification "今の瞬間を共有しませんか？📸" at the top of each hour,
  auto-silenced during the user's own sleep window; per-device on/off in
  More. Fires while the app is open/backgrounded — closed-app push needs the
  future backend. 6 new unit tests (25 total).

## [0.6.0] — 2026-07-07
### Added
- **Same Moment (v1.1 MVP)**: each partner takes one photo of "right now"
  per day; the pair reveals only when both sides have uploaded. Day boundary
  follows Tokyo time. Implemented without a backend using Cloudinary tags
  (`m-<day>-<role>`); per-device role picker (Tokyo/Santiago side).
- **Live Map (v1.1)**: canvas world map (Natural Earth 110m land) with both
  cities, great-circle route, live day/night terminator, distance (~17,242 km),
  and both sky cards. Geo math unit-tested (4 tests, 19 total).
### Changed
- Supabase backend deferred to v1.2+ (needed for notifications/streaks/
  realtime); Same Moment MVP ships without accounts.

## [0.5.0] — 2026-07-07
### Changed
- Full architecture migration: single-file `index.html` → Vite + React +
  TypeScript with feature-first structure (`features/*`, `shared/*`).
  Feature parity with v0.4; v0 preserved at `legacy/v0.html`.
- App-like navigation: bottom nav (Home / Moment / Map / Memories / More);
  Home is now a summary-card dashboard linking to detail pages.
### Added
- PWA: installable (manifest + icons), service worker with auto-update and
  runtime caching of Cloudinary media.
- 15 unit tests for all time-zone math (DST in both Chilean seasons,
  midnight-wrapping windows, overlap, anniversaries).
- Placeholder pages for Same Moment (v1.1) and Live Map (v1.1).

## [0.4.0] — 2026-07-06
### Added
- Modern UI: full-screen ambient background slideshow of couple photos
  (cross-fade + Ken Burns, respects `prefers-reduced-motion`), glassmorphism
  cards over a committed night theme.
- Parallel bulk upload (4 concurrent) with progress counter.

## [0.3.0] — 2026-07-06
### Added
- Memories: Cloudinary-backed shared photo/video stream, random memory card,
  in-app upload from both partners' phones (unsigned preset, tag `futari`).
- Share-link settings sync (`#s=` URL hash, base64url payload, import confirm).

## [0.2.0] — 2026-07-06
### Added
- "Together for N days" counter with dating start date.
- Recurring anniversaries list (auto yearly, days-until, auto entry for the
  dating anniversary), add/delete.
- i18n: Japanese / English / Spanish (es-CL), per-device, persisted.
- Mobile optimization: viewport meta (was missing), compact two-up sky cards,
  16px inputs (no iOS zoom), safe-area padding.

## [0.1.0] — 2026-07-06
### Added
- Initial dashboard: Tokyo/Santiago clocks with day/night sky cards,
  wake/sleep schedules, talk-window overlap timeline, reunion countdown,
  time converter. DST-safe via `Intl` IANA time zones.
- Deployed to Vercel: https://couple-dashboard-kappa.vercel.app
