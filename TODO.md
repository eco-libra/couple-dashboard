# TODO

## Phase 0 — Hygiene (before any refactor) ✅
- [x] `git init` + first commit of current v0
- [x] Move project to `~/dev/couple-dashboard`
- [x] Private GitHub repo: https://github.com/eco-libra/couple-dashboard
- [x] Vercel connected to the repo (push to main = production deploy)

## Phase 1 — v0.5 Foundation
- [ ] Scaffold Vite + React + TypeScript
- [ ] Extract design tokens from v0 CSS into `styles/tokens.css`
- [ ] Port pure logic to `shared/time` with unit tests (Vitest):
      offset math, overlap segments, next-anniversary, day-boundary cases
- [ ] Port i18n dictionaries to `shared/i18n`
- [ ] Build app shell: router + bottom nav (Home / Same Moment / Map / Memories / More)
- [ ] Port v0 features into `features/*` pages, keeping current visual design
- [ ] Home = summary cards (time, countdown, next talk window, memories teaser)
- [ ] PWA: manifest, icons, service worker (vite-plugin-pwa), install test on
      iPhone Safari and Xiaomi Chrome
- [ ] Verify feature parity against v0 checklist, then swap Vercel production

## Phase 2 — v1.1 Same Moment + Map
- [ ] Supabase project: auth (magic link), `couples`, `moments` tables, RLS
- [ ] Pairing flow: one partner invites via link, both devices linked
- [ ] Same Moment MVP: upload → lock → unlock when both uploaded
- [ ] Migrate settings sync from URL-hash to backend (keep hash as fallback)
- [ ] Live Map v1 (static SVG world map, avatars, distance, terminator)

## Later
- [ ] Exchange rate + holidays (v1.2)
- [ ] AI translation & suggestions via server route (v1.3)
- [ ] Analytics + Wrapped (v1.4)
- [ ] Flights, voice, calendar, push (v2.0)

## Known debt / bugs to watch
- [ ] Cloudinary list endpoint is CDN-cached → new uploads can take minutes
      to appear on the partner's device (acceptable for now; fix with backend)
- [ ] Upload has no client-side image compression → large videos are slow
- [ ] `confirm()`-based share-link import should become a proper dialog
