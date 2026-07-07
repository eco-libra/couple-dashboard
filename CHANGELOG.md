# Changelog

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
