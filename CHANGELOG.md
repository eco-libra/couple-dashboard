# Changelog

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
